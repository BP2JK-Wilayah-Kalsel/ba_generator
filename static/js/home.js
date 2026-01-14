(function(){
    try {
        const el = document.getElementById('currentYear');
        if (el) el.textContent = new Date().getFullYear();
    } catch (e) {
        console.error('Set current year failed', e);
    }
})();