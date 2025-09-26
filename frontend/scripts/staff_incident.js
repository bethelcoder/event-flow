function openPage(pageId, button) {
 
    document.getElementById('report').style.display = 'none';
    document.getElementById('my_reports').style.display = 'none';
    document.getElementById('staff_issues').style.display = 'none';
    document.getElementById('guest_issues').style.display = 'none';

    document.getElementById(pageId).style.display = 'block';


    const buttons = document.querySelectorAll('.btn_tablink');
    buttons.forEach(btn => btn.classList.remove('active'));
    button?.classList.add('active'); 
}

document.addEventListener('DOMContentLoaded', () => {
    openPage('report');
});