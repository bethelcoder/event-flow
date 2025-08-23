function openPage(pageId, button) {
   
    document.getElementById('Invitations').style.display = 'none';
    document.getElementById('Guest_list').style.display = 'none';
    document.getElementById('EmailTemplate').style.display = 'none';

    
    document.getElementById(pageId).style.display = 'block';
    
    const buttons = document.querySelectorAll('.btn_tablink');
    buttons.forEach(btn => btn.classList.remove('active'));

    button.classList.add('active');


document.addEventListener('DOMContentLoaded', () => {
    openPage('Invitations');
});
}
