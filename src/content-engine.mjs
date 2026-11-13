const topics={
 morning:[
 ["Bắt đầu bằng chánh niệm","Mỗi buổi sáng, hãy dành một phút nhận biết hơi thở. Khi tâm trở về hiện tại, ta có thêm sự sáng suốt để đối diện với những điều trong ngày."],
 ["Nuôi dưỡng lòng từ bi","Một lời nói dịu dàng và một hành động tử tế có thể làm ngày mới của ai đó nhẹ nhàng hơn. Hãy bắt đầu từ những người gần mình nhất."],
 ["Biết ơn điều giản dị","Còn được thức dậy, hít thở và gặp gỡ những người thương là những điều đáng trân quý. Hãy giữ lòng biết ơn trong từng việc nhỏ."],
 ["Tâm an giữa bộn bề","Không phải mọi việc đều diễn ra như ý. Ta có thể chọn bình tĩnh quan sát và hành động sáng suốt thay vì vội phản ứng."]
 ],
 evening:[
 ["Buông xuống muộn phiền","Một ngày đã qua, hãy nhẹ nhàng nhìn lại những gì mình đã trải nghiệm. Điều chưa trọn vẹn có thể tiếp tục vào ngày mai; tối nay hãy cho tâm được nghỉ ngơi."],
 ["Tha thứ cho chính mình","Ai cũng có lúc vụng về hoặc mắc sai lầm. Học từ điều đã qua rồi đối xử với bản thân bằng sự dịu dàng là một cách nuôi dưỡng bình an."],
 ["Trở về với hơi thở","Trước giờ nghỉ, hãy hít vào chậm và thở ra nhẹ. Nhận biết thân tâm trong giây phút này, không cần níu giữ chuyện đã qua."],
 ["Gửi lời chúc an lành","Hãy dành ít phút nhớ đến những người mình yêu thương, và cả những người đang gặp khó khăn. Nguyện mọi người có một đêm yên ổn."]
 ]
};
export function buildPost({date,period}) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!topics[period]) throw Error("Invalid slot");
 const day=Math.floor(Date.parse(date+"T00:00:00Z")/86400000);
 if(!Number.isFinite(day)) throw Error("Invalid date");
 const index=((day*2+(period==="evening"?1:0))%topics[period].length+topics[period].length)%topics[period].length;
 const [title,body]=topics[period][index];
 const greeting=period==="morning"?"Chúc mọi người một ngày mới thân tâm an lạc.":"Chúc mọi người một đêm bình yên và ngủ ngon trong chánh niệm.";
 return {period,date,message:title,text:title+" 🌸\n\n"+body+"\n\n🙏 "+greeting+"\n\n#PhapThoaiKhaiSang #ChanhNiem #BinhAn",variant:index%2};
}
