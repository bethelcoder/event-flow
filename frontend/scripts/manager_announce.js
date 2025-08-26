function openPage(pageId, button) {
    
    document.getElementById('form').style.display = 'none';
    document.getElementById('history').style.display = 'none';

    
    document.getElementById(pageId).style.display = 'block';

    const buttons = document.querySelectorAll('.btn_tablink');
    buttons.forEach(btn => btn.classList.remove('active'));

    
    if (button) {
        button.classList.add('active');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    openPage('form'); 
});
