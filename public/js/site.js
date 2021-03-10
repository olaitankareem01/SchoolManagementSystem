const AppConfig = {
    "apiBaseUrl": ""//"http://localhost:4000"
}
const getCategories = async () => {
    let response = await fetch(AppConfig.apiBaseUrl + '/categories');
    let categories = await response.json();
    let data = categories.map(function (cat) {
        return { 'id': cat.ID, 'text': cat.name };
    });
    $('#category-id').select2({
        data: data
    }).trigger('change');
        
}
$('#category-id').on('change', async function (element) {
    let categoryid = document.querySelector('#category-id').value;
    let response = await fetch(AppConfig.apiBaseUrl + '/classes/' + categoryid);
    let classes = await response.json();
    let data = classes.map(function (cls) {
        return { 'id': cls.ID, 'text': cls.classname };
    });
    document.querySelector('#class-id').innerHTML = '';
    $('#class-id').select2({
        data: data
    }).trigger('change');
});
getCategories();


//to get users
const getUsers = async () => {
    let response = await fetch(AppConfig.apiBaseUrl + '/users');
    let allusers = await response.json();
    let data = allusers.map(function (user) {

        return { 'id': user.ID, 'firstname': user.firstname, 'lastname': user.lastname, 'email': user.email, 'phone no': user.phone_no };
    });
    // $('#category-id').select2({
    //     data: data
    // }).trigger('change');
}
getUsers();

const postSignup = async () => {
    let response = await fetch(AppConfig.apiBaseUrl + '/users');
    let signupOutcome = await response.json();
    console.log(signupOutcome);
}
postSignup();





/*$(document).ready(function () {
    $("#submitbutton").submit(function () {

        Swal.fire({
            title: "Good job!",
            text: "You clicked the button!",
            icon: "success"

        });
    });
});*/
function congrats() {
    Swal.fire({
        title: "Congratulations!",
        text: "Your application has been submitted",
        icon: "success"

    });
}
//search bar
$(document).ready(function () {
    $("#myInput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#tablerow tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});

function formatDate() {
    var d = document.getElementById("dateformatted")
    d.innerHTML = d.toDateString();
}
formatDate();
// $(document).ready(function () {
//     var datevalue = $(dateformatted).val();
//     datevalue = 

// });
/*unction loginsuccessful() {
    Swal.fire({
        title: "Login successful!",

        icon: "success"

    });
}*/



/*$(document).ready(function () {

    ("#submitbutton").on('submit', function (e) { //also can use on submit
        e.preventDefault(); //prevent submit
        Swal.fire({
            title: "Are you sure?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "Cancel",
            closeOnConfirm: true
        }
}).then(function (value) {
            if (value) {
                $('#applicationform').submit();
                Swal.fire({
                    title: "Congratulations!",
                    text: "Your application has been submitted",
                    icon: "success"

                });
            }
            else {
                Swal.fire({
                    title: "Sorry!",
                    text: "Your application was not submitted",
                    icon: "Error"

                });
            }
        });
});*/



{/* <script language="javascript">// <![CDATA[
$(document).ready(function() {
        $('#contact-form').submit(function (ev) {
            ev.preventDefault();

            $.ajax({
                type: 'POST',
                url: 'envio.php', //$(this).attr('action')'',
                data: $(this).serialize(),
                success: function (data) {
                    openSubmitPopup(); //Assume, the function to show pop up works perfectly :)
                }
            });
            ev.preventDefault();
            return false;
        });
})
// ]]></script> */}