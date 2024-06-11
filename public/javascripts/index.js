

$("#send-button").click(function(){
    let postData = {
        phoneNo: $("#tel-no").val(),
        msgText: $("#msg-text").val(),
        usrName: $("#name").val()
    }
    $.post("/send-message", postData, function(data, status){
      console.log("Data: " + postData + "\nStatus: " + status);
    });
  });