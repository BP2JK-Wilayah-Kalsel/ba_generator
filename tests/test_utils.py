from app.utils import terbilang, replace_keywords_in_text


def test_terbilang_zero():
    assert terbilang(0) == "nol"


def test_terbilang_capitalize():
    assert terbilang(13, capitalize_each_word=True) == "Tiga Belas"


def test_replace_keywords_basic():
    text = "Halo {nama}, umur {umur}"
    keywords = {"nama": "Andi", "umur": 30}
    new_text, cnt = replace_keywords_in_text(text, keywords)
    assert new_text == "Halo Andi, umur 30"
    assert cnt == 2
