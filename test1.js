$(".cagree").on("change", function(e){
  if($(".cagree").attr("checked")){
    $(".submit").button("enable");
  } else {
    $(".submit").button("disable");
  }
  
});
