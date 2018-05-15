export default {
    //生成uuid,创建新类的标识
    getuuid(){
        var uid = [];
        var hexDigits = "0123456789abcdefghijklmnopqrst";
        for (var i = 0; i < 32; i++) {
            uid[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        uid[6] = "4";  
        uid[15] = hexDigits.substr((uid[15] & 0x3) | 0x8, 1);  
        var uuid = uid.join("");
        return uuid;
    },
     //转换经纬度==>“度分秒的形式”
     transforms(degrees) {
        var du = Math.floor(degrees);
        var fenzheng = (degrees - du) * 60;
        var fen = Math.floor(fenzheng);
        var mz = Math.floor((fenzheng - fen) * 60);
        var degreesFormat = du + '°' + fen + '′' + mz + '″';
        return degreesFormat;
    },
    //时间为毫秒数
    tansform_times(times) {
        var stamp = times.replace(/T/, ' ');
        var formStamp = stamp.replace(new RegExp("-", "gm"), "/");
        var starttimeHaoMiao = (new Date(formStamp)).getTime();
        return starttimeHaoMiao;
    },
}