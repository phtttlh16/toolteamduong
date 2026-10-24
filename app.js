const $=id=>document.getElementById(id);
let recipients=[], editId=null, nextId=1;
const dialog=$('recipientDialog'), infoDialog=$('infoDialog');
function openForm(id=null){
 editId=id;
 const item=recipients.find(x=>x.id===id);
 $('dialogTitle').textContent=item?'Sửa người nhận':'Thêm người nhận';
 $('recipientName').value=item?.name||'';
 $('recipientPhone').value=item?.phone||'';
 $('recipientMessage').value=item?.message||'';
 dialog.showModal(); $('recipientName').focus();
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function render(){
 const query=$('search').value.trim().toLowerCase();
 const filtered=recipients.filter(r=>(r.name+' '+r.phone+' '+r.message).toLowerCase().includes(query));
 $('recipientRows').innerHTML=filtered.map(r=>`<tr>
 <td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.phone)}</td>
 <td class="message-cell">${escapeHtml(r.message)}</td>
 <td><span class="status-tag">Bản nháp · chưa gửi</span></td>
 <td><div class="row-actions"><button class="icon-btn" data-edit="${r.id}">Sửa</button><button class="icon-btn delete" data-delete="${r.id}">Xóa</button></div></td></tr>`).join('');
 $('emptyState').style.display=recipients.length?'none':'block';
 $('metricRecipients').textContent=recipients.length;
 $('metricMessages').textContent=recipients.filter(r=>r.message.trim()).length;
 $('draftSummary').textContent=`${recipients.length} người nhận · ${recipients.filter(r=>r.message.trim()).length} tin có nội dung`;
 $('recipientRows').querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openForm(Number(b.dataset.edit)));
 $('recipientRows').querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{const id=Number(b.dataset.delete);if(confirm('Xóa người nhận này khỏi danh sách?')){recipients=recipients.filter(r=>r.id!==id);render();}});
}
$('addRecipient').onclick=()=>openForm();
$('emptyAdd').onclick=()=>openForm();
$('closeDialog').onclick=$('cancelDialog').onclick=()=>dialog.close();
$('search').addEventListener('input',render);
$('recipientForm').addEventListener('submit',e=>{
 e.preventDefault();
 const name=$('recipientName').value.trim(), phone=$('recipientPhone').value.trim(), message=$('recipientMessage').value.trim();
 if(!name||!phone||!message){alert('Vui lòng nhập tên, số điện thoại và nội dung tin nhắn.');return;}
 if(editId!==null){const r=recipients.find(x=>x.id===editId);Object.assign(r,{name,phone,message});}
 else recipients.push({id:nextId++,name,phone,message});
 dialog.close();render();
});
$('exportCsv').onclick=()=>{
 if(!recipients.length){$('feedback').textContent='Danh sách đang trống. Hãy thêm người nhận trước khi xuất.';return;}
 const csv=[['Tên','Số điện thoại','Nội dung tin nhắn','Trạng thái'],...recipients.map(r=>[r.name,r.phone,r.message,'Bản nháp - chưa gửi'])].map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
 const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='team-duong-danh-sach-zalo.csv';a.click();URL.revokeObjectURL(url);
 $('feedback').textContent='Đã xuất CSV. Lưu ý: file chỉ chứa danh sách bản nháp, không gửi tin Zalo.';
};
$('reviewSend').onclick=()=>{
 const count=recipients.filter(r=>r.phone.trim()&&r.message.trim()).length;
 $('feedback').textContent=count?`Đã kiểm tra ${count} tin nhắn có đủ số điện thoại và nội dung. Chưa gửi tin thật vì chưa tích hợp API.`:'Chưa có tin nhắn hợp lệ. Hãy thêm số điện thoại và nội dung riêng.';
};
$('requirements').onclick=()=>infoDialog.showModal();
$('closeInfo').onclick=$('gotIt').onclick=()=>infoDialog.close();
render();