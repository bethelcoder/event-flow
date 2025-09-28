function openPage(pageId, button) {
    document.getElementById('staff_issues').style.display = 'none';
    document.getElementById('guest_issues').style.display = 'none';

    document.getElementById(pageId).style.display = 'block';


    const buttons = document.querySelectorAll('.btn_tablink');
    buttons.forEach(btn => btn.classList.remove('active'));
    button?.classList.add('active'); 
}

document.addEventListener('DOMContentLoaded', () => {
    openPage('staff_issues');
});