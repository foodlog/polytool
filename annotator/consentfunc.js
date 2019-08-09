// var checkBoxes = $('input.consent'),
//     submitButton = $('#consentsubmit');
//
// checkBoxes.change(function () {
//     submitButton.attr("disabled", checkBoxes.is(":not(:checked)"));
//     if(checkBoxes.is(":not(:checked)")) {
//         submitButton.addClass('disabled');
//     } else {
//         submitButton.removeClass('disabled');
//     }
// });

EnableSubmit = function(val)
{
    var sbmt = document.getElementById("Accept");

    if (val.checked == true)
    {
        sbmt.disabled = false;
    }
    else
    {
        sbmt.disabled = true;
    }
}      
