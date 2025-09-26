function openPage(pageId, button) {
 
    document.getElementById('pending').style.display = 'none';
    document.getElementById('complete').style.display = 'none';

    document.getElementById(pageId).style.display = 'block';


    const buttons = document.querySelectorAll('.btn_tablink');
    buttons.forEach(btn => btn.classList.remove('active'));
    button?.classList.add('active'); 
}

document.addEventListener('DOMContentLoaded', () => {
    openPage('pending');
});