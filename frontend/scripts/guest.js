function openPage(pageId, button) {
   
    document.getElementById('qr').style.display = 'none';
    document.getElementById('program').style.display = 'none';
    document.getElementById('venue').style.display = 'none';
    document.getElementById('report').style.display = 'none';

    
    document.getElementById(pageId).style.display = 'block';
    
    const buttons = document.querySelectorAll('.btn_tablink');
    buttons.forEach(btn => btn.classList.remove('active'));

    button.classList.add('active');
}
document.addEventListener('DOMContentLoaded', () => {
    // const firstButton = document.querySelector('.btn_tablink');
    openPage('qr');
});