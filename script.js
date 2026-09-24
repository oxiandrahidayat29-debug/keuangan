const key="andra-data";
let data=[];
try{const stored=localStorage.getItem(key);data=stored?JSON.parse(stored):[];if(!Array.isArray(data))data=[];}catch(e){data=[];}
const $=id=>document.getElementById(id);
const money=n=>"Rp "+Number(n||0).toLocaleString("id-ID");
const today=new Date().toISOString().slice(0,10);
if($("date"))$("date").value=today;
function save(){
try{
localStorage.setItem(key,JSON.stringify(data));
const s=$("saveStatus");
if(s){s.textContent="✓ Data keuangan tersimpan di perangkat ini.";clearTimeout(window.__saveTimer);window.__saveTimer=setTimeout(()=>s.textContent="Data tersimpan otomatis di perangkat ini.",2500);}


function saveFinance(){
  try{
    localStorage.setItem(key,JSON.stringify(data));
    const s=$("saveStatus");
    if(s){
      s.textContent="✓ Data keuangan tersimpan.";
      clearTimeout(window.__saveTimer);
      window.__saveTimer=setTimeout(()=>s.textContent="Data tersimpan otomatis di perangkat ini.",2500);
    }
    render();
  }catch(e){
    console.error("Gagal menyimpan data:",e);
    const s=$("saveStatus");
    if(s)s.textContent="⚠ Gagal menyimpan data pada perangkat.";
  }
}
const saveFinanceBtn=$("saveFinanceBtn");
if(saveFinanceBtn)saveFinanceBtn.onclick=saveFinance;

render();
}catch(e){const s=$("saveStatus");if(s)s.textContent="⚠ Gagal menyimpan data pada perangkat.";}
}
function render(){let income=data.filter(x=>x.type==="income").reduce((s,x)=>s+x.amount,0),expense=data.filter(x=>x.type==="expense").reduce((s,x)=>s+x.amount,0);$("income").textContent=money(income);$("expense").textContent=money(expense);$("saving").textContent=money(income-expense);$("saldo").textContent=money(income-expense);let q=$("search").value.toLowerCase();let rows=data.filter(x=>(x.desc+" "+x.cat).toLowerCase().includes(q)).sort((a,b)=>b.date.localeCompare(a.date));$("tbody").innerHTML=rows.length?rows.map(x=>`<tr><td>${x.date}</td><td><b>${x.desc}</b></td><td>${x.cat}</td><td><span class="tag ${x.type==="income"?"in":"out"}">${x.type==="income"?"PEMASUKAN":"PENGELUARAN"}</span></td><td>${x.type==="income"?"+":"-"} ${money(x.amount)}</td><td><button class="delete" onclick="del('${x.id}')">×</button></td></tr>`).join(""):`<tr><td colspan="6" style="text-align:center;color:#999;padding:35px">Belum ada transaksi.</td></tr>`;renderBars();drawChart()}
function del(id){data=data.filter(x=>x.id!==id);save()}
function renderBars(){let cats={};data.filter(x=>x.type==="expense").forEach(x=>cats[x.cat]=(cats[x.cat]||0)+x.amount);let vals=Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,6),max=vals[0]?.[1]||1;$("categoryChart").innerHTML=vals.length?vals.map(([k,v])=>`<div class="bar-row"><span>${k}</span><div class="bar"><i style="width:${v/max*100}%"></i></div><b>${money(v)}</b></div>`).join(""):"<p style='color:#999;font-size:12px'>Belum ada pengeluaran.</p>"}
function drawChart(){let c=$("chart"),ctx=c.getContext("2d"),w=c.clientWidth*2,h=260*2;c.width=w;c.height=h;ctx.clearRect(0,0,w,h);let months=[...Array(6)].map((_,i)=>{let d=new Date();d.setMonth(d.getMonth()-5+i);return d.toISOString().slice(0,7)}),inc=months.map(m=>data.filter(x=>x.type==="income"&&x.date.startsWith(m)).reduce((s,x)=>s+x.amount,0)),out=months.map(m=>data.filter(x=>x.type==="expense"&&x.date.startsWith(m)).reduce((s,x)=>s+x.amount,0)),max=Math.max(...inc,...out,1);ctx.lineWidth=5;[[inc,"#19b77b"],[out,"#e45e5e"]].forEach(([arr,col])=>{ctx.strokeStyle=col;ctx.beginPath();arr.forEach((v,i)=>{let x=35+i*(w-70)/5,y=h-35-(v/max)*(h-70);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke()});ctx.fillStyle="#89949d";ctx.font="20px Arial";months.forEach((m,i)=>ctx.fillText(m.slice(5),25+i*(w-70)/5,h-8))}
$("openModal").onclick=()=>$("modal").classList.add("show");$("close").onclick=()=>$("modal").classList.remove("show");$("search").oninput=render;$("themeBtn").onclick=()=>{document.body.classList.toggle("dark");$("themeBtn").textContent=document.body.classList.contains("dark")?"☀ Mode Terang":"☾ Mode Gelap"};
$("form").onsubmit=e=>{e.preventDefault();data.push({id:Date.now().toString(),type:$("type").value,date:$("date").value,desc:$("desc").value,cat:$("cat").value,amount:Number($("amount").value)});save();e.target.reset();$("date").value=today;$("modal").classList.remove("show")};
const exportBtn=$("exportBtn");if(exportBtn)exportBtn.onclick=()=>{let csv="Tanggal,Keterangan,Kategori,Tipe,Jumlah\n"+data.map(x=>`${x.date},"${x.desc}",${x.cat},${x.type},${x.amount}`).join("\n");let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="andra-transaksi.csv";a.click()};render();
