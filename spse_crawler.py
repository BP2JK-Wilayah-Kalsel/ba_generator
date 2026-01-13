"""
SPSE INAPROC Jadwal Crawler
============================
Utility untuk crawl jadwal tahapan dari SPSE INAPROC
"""

import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime


def crawl_spse_jadwal(kode_tender):
    """
    Crawl jadwal tahapan dari SPSE INAPROC
    
    Args:
        kode_tender (str): Kode tender/lelang (contoh: "10092420000")
        
    Returns:
        dict: Response dengan data jadwal atau error
    """
    
    # Construct URL
    url = f"https://spse.inaproc.id/pu/lelang/{kode_tender}/jadwal"
    referer = "https://spse.inaproc.id/pu"
    
    # Setup headers sesuai screenshot
    headers = {
        'authority': 'spse.inaproc.id',
        'method': 'GET',
        'path': f'/pu/lelang/{kode_tender}/jadwal',
        'scheme': 'https',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-GB,en-US;q=0.9,id;q=0.8,id-ID;q=0.7',
        'Cache-Control': 'max-age=0',
        'Priority': 'u=0, i',
        'Referer': referer,
        'Sec-Ch-Ua': '"Google Chrome";v="141", "NotYA Brand";v="8", "Chromium";v="141"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
    }
    
    try:
        print(f"[SPSE] Fetching jadwal from: {url}")
        
        # Make request with timeout
        response = requests.get(url, headers=headers, timeout=30)
        
        # Check status
        if response.status_code != 200:
            return {
                'success': False,
                'error': f'HTTP {response.status_code}: {response.reason}',
                'url': url
            }
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find schedule table
        jadwal_data = parse_jadwal_table(soup)
        
        if not jadwal_data:
            return {
                'success': False,
                'error': 'Tidak dapat menemukan tabel jadwal di halaman',
                'url': url,
                'html_preview': str(soup)[:500]  # First 500 chars for debugging
            }
        
        print(f"[SPSE] Successfully parsed {len(jadwal_data)} tahapan")
        
        return {
            'success': True,
            'kode_tender': kode_tender,
            'url': url,
            'total_tahapan': len(jadwal_data),
            'jadwal': jadwal_data,
            'fetched_at': datetime.now().isoformat()
        }
        
    except requests.exceptions.Timeout:
        return {
            'success': False,
            'error': 'Request timeout (lebih dari 30 detik)',
            'url': url
        }
    except requests.exceptions.ConnectionError:
        return {
            'success': False,
            'error': 'Tidak dapat terhubung ke server SPSE',
            'url': url
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Error: {str(e)}',
            'url': url
        }


def parse_jadwal_table(soup):
    """
    Parse tabel jadwal dari BeautifulSoup object
    
    Args:
        soup (BeautifulSoup): Parsed HTML
        
    Returns:
        list: List of dict dengan data jadwal
    """
    
    jadwal_list = []
    
    # Try to find table with jadwal
    # Common patterns: class="table", id="jadwal", etc.
    tables = soup.find_all('table')
    
    if not tables:
        print("[SPSE] No tables found in page")
        return None
    
    print(f"[SPSE] Found {len(tables)} table(s), parsing...")
    
    # Try each table to find the schedule one
    for table in tables:
        rows = table.find_all('tr')
        
        # Skip if too few rows (need at least header + 1 data)
        if len(rows) < 2:
            continue
        
        # Check if this looks like a schedule table
        # Usually has columns: No, Tahap, Mulai, Sampai/Selesai, etc.
        header_row = rows[0]
        headers = [th.get_text(strip=True).lower() for th in header_row.find_all(['th', 'td'])]
        
        # Check if this is the schedule table
        if not ('tahap' in ' '.join(headers) or 'kegiatan' in ' '.join(headers)):
            continue
        
        print(f"[SPSE] Found schedule table with headers: {headers}")
        
        # Parse data rows
        for i, row in enumerate(rows[1:], 1):
            cols = row.find_all(['td', 'th'])
            
            if len(cols) < 3:  # Need at least 3 columns
                continue
            
            # Extract text from each column
            col_texts = [col.get_text(strip=True) for col in cols]
            
            # Try to identify columns
            # Common patterns:
            # [No, Tahap, Mulai, Sampai, ...]
            # [No, Kegiatan, Tanggal Mulai, Tanggal Selesai, ...]
            
            if len(col_texts) >= 4:
                no = col_texts[0]
                tahap = col_texts[1]
                mulai = col_texts[2]
                sampai = col_texts[3]
                perubahan = col_texts[4] if len(col_texts) > 4 else ''
                
                # Skip empty rows
                if not tahap or tahap == '-':
                    continue
                
                jadwal_list.append({
                    'no': no,
                    'tahap': tahap,
                    'mulai': mulai,
                    'sampai': sampai,
                    'perubahan': perubahan
                })
        
        # If we found data, break (assuming first valid table is the one we want)
        if jadwal_list:
            break
    
    return jadwal_list if jadwal_list else None


def format_jadwal_for_paste(jadwal_data):
    """
    Format jadwal data menjadi text yang bisa di-paste ke textarea
    
    Args:
        jadwal_data (list): List of dict dari parse_jadwal_table
        
    Returns:
        str: Formatted text untuk paste
    """
    
    if not jadwal_data:
        return ""
    
    lines = []
    for item in jadwal_data:
        # Format: No\tTahap\tMulai\tSampai\tPerubahan
        line = f"{item['no']}\t{item['tahap']}\t{item['mulai']}\t{item['sampai']}\t{item.get('perubahan', '')}"
        lines.append(line)
    
    return '\n'.join(lines)


def crawl_spse_pengumuman(kode_tender):
    """
    Crawl data pengumuman lelang dari SPSE INAPROC
    
    Args:
        kode_tender (str): Kode tender/lelang (contoh: "10094973000")
        
    Returns:
        dict: Response dengan data pengumuman atau error
    """
    
    # Construct URL
    url = f"https://spse.inaproc.id/pu/lelang/{kode_tender}/pengumumanlelang"
    referer = "https://spse.inaproc.id/pu"
    
    # Setup headers
    headers = {
        'authority': 'spse.inaproc.id',
        'method': 'GET',
        'path': f'/pu/lelang/{kode_tender}/pengumumanlelang',
        'scheme': 'https',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-GB,en-US;q=0.9,id;q=0.8,id-ID;q=0.7',
        'Cache-Control': 'max-age=0',
        'Referer': referer,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
    }
    
    try:
        print(f"[SPSE] Fetching pengumuman from: {url}")
        
        # Make request with timeout
        response = requests.get(url, headers=headers, timeout=30)
        
        # Check status
        if response.status_code != 200:
            return {
                'success': False,
                'error': f'HTTP {response.status_code}: {response.reason}',
                'url': url
            }
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract data from the page
        pengumuman_data = parse_pengumuman_page(soup)
        
        if not pengumuman_data:
            return {
                'success': False,
                'error': 'Tidak dapat menemukan data pengumuman di halaman',
                'url': url
            }
        
        print(f"[SPSE] Successfully parsed pengumuman data")
        
        return {
            'success': True,
            'kode_tender': kode_tender,
            'url': url,
            'data': pengumuman_data,
            'fetched_at': datetime.now().isoformat()
        }
        
    except requests.exceptions.Timeout:
        return {
            'success': False,
            'error': 'Request timeout (lebih dari 30 detik)',
            'url': url
        }
    except requests.exceptions.ConnectionError:
        return {
            'success': False,
            'error': 'Tidak dapat terhubung ke server SPSE',
            'url': url
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Error: {str(e)}',
            'url': url
        }


def parse_pengumuman_page(soup):
    """
    Parse halaman pengumuman lelang untuk mengekstrak data
    
    Returns:
        dict: Data pengumuman yang di-extract
    """
    data = {}
    
    try:
        # Find main table with class 'table-bordered'
        main_table = soup.find('table', class_='table-bordered')
        
        if not main_table:
            print("[SPSE] Main table not found")
            return None
        
        # Get all rows
        rows = main_table.find_all('tr')
        
        for row in rows:
            # Get all th and td elements in this row
            ths = row.find_all('th', class_='bgwarning')
            tds = row.find_all('td')
            
            if not ths or not tds:
                continue
            
            # Process each th-td pair in the row
            for i, th in enumerate(ths):
                if i >= len(tds):
                    break
                
                label = th.get_text(strip=True)
                value = tds[i].get_text(strip=True)
                
                # Map specific fields
                if 'Nama Paket' in label or 'Nama Tender' in label:
                    # Check if it's in nested table
                    nested_table = tds[i].find('table')
                    if nested_table:
                        nested_td = nested_table.find('td')
                        if nested_td and len(nested_td.get_text(strip=True)) > len(value) / 2:
                            value = nested_td.get_text(strip=True)
                    data['nama_paket'] = value
                
                elif 'Kode RUP' in label:
                    data['kode_rup'] = value
                
                elif 'K/L/PD/Instansi' in label:
                    data['klpd'] = value
                
                elif 'Satuan Kerja' in label:
                    data['satuan_kerja'] = value
                
                elif 'Nilai Pagu' in label:
                    data['nilai_pagu_display'] = value
                    # Clean number: "Rp. 5.924.917.000,00" -> "5924917000"
                    pagu_number = value.replace('Rp', '').replace('.', '').replace(',00', '').replace(' ', '').strip()
                    data['nilai_pagu'] = pagu_number
                
                elif 'Nilai HPS' in label:
                    data['nilai_hps_display'] = value
                    # Clean number
                    hps_number = value.replace('Rp', '').replace('.', '').replace(',00', '').replace(' ', '').strip()
                    data['nilai_hps'] = hps_number
                
                elif 'Jenis Pengadaan' in label:
                    data['jenis_pengadaan'] = value
                
                elif 'Metode Pengadaan' in label:
                    data['metode_pengadaan'] = value
        
        return data if data else None
        
    except Exception as e:
        print(f"[SPSE] Error parsing pengumuman: {e}")
        return None


# Flask endpoint (untuk diintegrasikan ke baapp.py)
def create_spse_endpoint(app):
    """
    Tambahkan endpoint /api/crawl_spse_jadwal dan /api/crawl_spse_pengumuman ke Flask app
    
    Usage:
        from spse_crawler import create_spse_endpoint
        create_spse_endpoint(app)
    """
    
    @app.route('/api/crawl_spse_jadwal', methods=['POST'])
    def crawl_spse_jadwal_endpoint():
        from flask import request, jsonify
        
        data = request.json
        kode_tender = data.get('kode_tender', '')
        
        if not kode_tender:
            return jsonify({
                'success': False,
                'error': 'Parameter kode_tender diperlukan'
            }), 400
        
        # Clean kode tender (remove non-digits)
        kode_tender = ''.join(filter(str.isdigit, kode_tender))
        
        if not kode_tender:
            return jsonify({
                'success': False,
                'error': 'Kode tender tidak valid (harus berisi angka)'
            }), 400
        
        # Crawl
        result = crawl_spse_jadwal(kode_tender)
        
        # Add formatted text for easy paste
        if result.get('success') and result.get('jadwal'):
            result['formatted_text'] = format_jadwal_for_paste(result['jadwal'])
        
        return jsonify(result)
    
    @app.route('/api/crawl_spse_pengumuman', methods=['POST'])
    def crawl_spse_pengumuman_endpoint():
        from flask import request, jsonify
        
        data = request.json
        kode_tender = data.get('kode_tender', '')
        
        if not kode_tender:
            return jsonify({
                'success': False,
                'error': 'Parameter kode_tender diperlukan'
            }), 400
        
        # Clean kode tender (remove non-digits)
        kode_tender = ''.join(filter(str.isdigit, kode_tender))
        
        if not kode_tender:
            return jsonify({
                'success': False,
                'error': 'Kode tender tidak valid (harus berisi angka)'
            }), 400
        
        # Crawl
        result = crawl_spse_pengumuman(kode_tender)
        
        return jsonify(result)


# Testing/standalone mode
if __name__ == '__main__':
    import sys
    
    # Test with example kode tender
    if len(sys.argv) > 1:
        kode_tender = sys.argv[1]
    else:
        kode_tender = '10092420000'  # Default example
    
    print(f"\n{'='*60}")
    print(f"Testing SPSE Crawler with kode tender: {kode_tender}")
    print(f"{'='*60}\n")
    
    result = crawl_spse_jadwal(kode_tender)
    
    if result['success']:
        print(f"\n✅ Success! Found {result['total_tahapan']} tahapan:")
        print(f"\nURL: {result['url']}")
        print(f"\nJadwal Data:")
        print(json.dumps(result['jadwal'], indent=2, ensure_ascii=False))
        
        print(f"\n\n{'='*60}")
        print("Formatted for Paste (copy this to textarea):")
        print(f"{'='*60}\n")
        print(format_jadwal_for_paste(result['jadwal']))
    else:
        print(f"\n❌ Failed: {result['error']}")
        if 'html_preview' in result:
            print(f"\nHTML Preview:\n{result['html_preview']}")
