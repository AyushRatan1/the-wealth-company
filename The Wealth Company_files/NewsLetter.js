function AddNewsletter() {
    if ($("#emailInput").val().trim() === "") {
        alert("Please enter a valid email address.");
        return;
    }
    $.ajax({
        //url: "/WealthCmp/InsertNewsLetter",
        url: maregistrationapi+"/api/User/NewsLetter?Email=" + $("#emailInput").val(),
        type:"POST",
        data: {
            //Email: $("#emailInput").val()
        },
        success: function (data) {

            if (data.code == 200) {
                document.getElementById("thankYouModal").classList.remove("invisible");
                document.getElementById("thankYouModal").classList.add("opacity-100");

                // Optionally, clear the input after subscribing:
                emailInput.value = "";
            }
        },
        error: function (data) {

        }
    });
}