// Editorially curated original reflections. No fabricated Buddha quotations or
// unattributed scriptural citations. Deterministic selection per Vietnam slot.
const topics={
 morning:[
 ["Bắt đầu bằng chánh niệm","Mỗi buổi sáng, hãy dành một phút nhận biết hơi thở. Khi tâm trở về hiện tại, ta có thêm sự sáng suốt để đối diện với những điều trong ngày."],
 ["Nuôi dưỡng lòng từ bi","Một lời nói dịu dàng và một hành động tử tế có thể làm ngày mới của ai đó nhẹ nhàng hơn. Hãy bắt đầu từ những người gần mình nhất."],
 ["Biết ơn điều giản dị","Còn được thức dậy, hít thở và gặp gỡ những người thương là những điều đáng trân quý. Hãy giữ lòng biết ơn trong từng việc nhỏ."],
 ["Tâm an giữa bộn bề","Không phải mọi việc đều diễn ra như ý. Ta có thể chọn bình tĩnh quan sát và hành động sáng suốt thay vì vội phản ứng."],
 ["Một ngày sống tỉnh thức","Đừng vội để những lo toan dẫn dắt cả ngày. Hãy bắt đầu bằng một hơi thở sâu, rồi chọn làm điều hữu ích với sự chú tâm."],
 ["Gieo hạt giống thiện lành","Mỗi việc tốt nhỏ bé đều có ý nghĩa. Một lời cảm ơn chân thành hay một sự giúp đỡ đúng lúc có thể lan tỏa sự ấm áp."],
 ["Lắng nghe bằng trái tim","Khi trò chuyện, hãy thử nghe hết lời người đối diện trước khi phản hồi. Sự lắng nghe chân thành giúp nuôi dưỡng hiểu biết và thương yêu."],
 ["Chậm lại để thấy rõ","Giữa nhịp sống hối hả, đôi khi một phút dừng lại giúp ta nhận ra điều quan trọng. Hãy hành động từ sự sáng suốt thay vì vội vàng."],
 ["Mỉm cười với hiện tại","Ta không cần đợi mọi điều hoàn hảo mới có thể mỉm cười. Hãy nhận ra một niềm vui giản dị đang hiện hữu ngay trong hôm nay."],
 ["Học cách kiên nhẫn","Có những việc cần thời gian để chuyển hóa. Hãy kiên nhẫn với bản thân và người khác, đồng thời tiếp tục bước đi bằng hành động tử tế."],
 ["Giữ tâm khiêm nhường","Mỗi người ta gặp đều có điều đáng học hỏi. Khi bớt vội phán xét, ta mở lòng đón nhận những góc nhìn và trải nghiệm mới."],
 ["Sống trọn một ngày","Ngày hôm nay không thể lặp lại. Hãy dành sự hiện diện thật sự cho công việc, người thân và cả những khoảnh khắc bình thường."]
 ],
 evening:[
 ["Buông xuống muộn phiền","Một ngày đã qua, hãy nhẹ nhàng nhìn lại những gì mình đã trải nghiệm. Điều chưa trọn vẹn có thể tiếp tục vào ngày mai; tối nay hãy cho tâm được nghỉ ngơi."],
 ["Tha thứ cho chính mình","Ai cũng có lúc vụng về hoặc mắc sai lầm. Học từ điều đã qua rồi đối xử với bản thân bằng sự dịu dàng là một cách nuôi dưỡng bình an."],
 ["Trở về với hơi thở","Trước giờ nghỉ, hãy hít vào chậm và thở ra nhẹ. Nhận biết thân tâm trong giây phút này, không cần níu giữ chuyện đã qua."],
 ["Gửi lời chúc an lành","Hãy dành ít phút nhớ đến những người mình yêu thương, và cả những người đang gặp khó khăn. Nguyện mọi người có một đêm yên ổn."],
 ["Nhìn lại bằng lòng biết ơn","Trước khi khép lại một ngày, hãy nhớ đến một điều tốt đẹp dù rất nhỏ. Sự biết ơn giúp ta nhận ra những nguồn nâng đỡ quanh mình."],
 ["Thả lỏng những lo âu","Không phải câu hỏi nào cũng cần lời giải ngay tối nay. Hãy ghi nhận điều đang bận lòng và cho bản thân thời gian nghỉ ngơi."],
 ["Đối diện mà không trách móc","Nếu hôm nay có điều chưa như ý, hãy nhìn lại với thái độ học hỏi. Sự thành thật và dịu dàng giúp ta trưởng thành từng ngày."],
 ["Bình yên trong im lặng","Đôi khi chỉ cần tắt bớt tiếng ồn và ngồi yên vài phút. Lắng nghe hơi thở cũng là cách chăm sóc đời sống nội tâm."],
 ["Nuôi dưỡng sự cảm thông","Ai cũng có những nỗi khó khăn chưa thể nói thành lời. Hãy khép ngày bằng một chút cảm thông thay vì giữ lại những phán xét."],
 ["Hôm nay đã đủ rồi","Bạn đã đi qua một ngày với nhiều cố gắng. Hãy nhận biết những gì mình làm được và cho phép cơ thể, tâm trí được nghỉ ngơi."],
 ["Giữ lại điều thiện lành","Khi nhìn lại ngày qua, hãy nhớ một hành động tử tế đã trao đi hoặc nhận được. Điều tốt đẹp nhỏ bé có thể tiếp sức cho ngày mai."],
 ["Nguyện một đêm an yên","Dành một khoảnh khắc gửi lời chúc bình an đến người thân và mọi người. Hãy nhẹ nhàng trở về với giấc ngủ, không mang theo tranh hơn thua."]
 ]
};
export function buildPost({date,period}) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Object.hasOwn(topics,period)) throw Error("Invalid slot");
 const day=Math.floor(Date.parse(date+"T00:00:00Z")/86400000);
 if(!Number.isFinite(day)) throw Error("Invalid date");
 // Coprime stride relative to 12 entries; adjacent days vary.
 const index=((day*5+(period==="evening"?3:0))%topics[period].length+topics[period].length)%topics[period].length;
 const [title,body]=topics[period][index];
 const greeting=period==="morning"?"Chúc mọi người một ngày mới thân tâm an lạc.":"Chúc mọi người một đêm bình yên và ngủ ngon trong chánh niệm.";
 return {period,date,message:title,text:title+" 🌸\n\n"+body+"\n\n🙏 "+greeting+"\n\n#PhapThoaiKhaiSang #ChanhNiem #BinhAn",variant:index%2};
}
