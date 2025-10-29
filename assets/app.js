// Limit interests to 2 selections & show count
const boxes = Array.from(document.querySelectorAll('#interests input[type=checkbox]'));
const hint = document.getElementById('interestHint');
function updateHint(){
  const c = boxes.filter(b=>b.checked).length;
  hint.textContent = `${c}/2 selected`;
}
boxes.forEach(b=>{
  b.addEventListener('change', e=>{
    const checked = boxes.filter(x=>x.checked);
    if(checked.length>2){
      e.target.checked = false;
      alert('Please select at most 2 interests.');
    }
    updateHint();
  });
});
updateHint();

// Front-end validation
document.getElementById('regForm').addEventListener('submit', (e)=>{
  const required = ['registration_no','name','email','dob','program'];
  for(const id of required){
    const el = document.getElementById(id);
    if(!el.value){
      alert('Please fill all required fields.');
      el.focus();
      e.preventDefault();
      return;
    }
  }
});
