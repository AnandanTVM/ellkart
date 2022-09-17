$(document).ready(function () {
    // Validate Username
    $("#singupForm").validate({
        rules: {
            name: {
                required: true,
                minlength: 2
            },
            dob: {
                required: true,

            },
            email: {
                required: true,
                email: true
            },

            phone: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10
            },
            password: {
                required: true,
                minlength: 8
            },
            passwordConfirm: {
                required: true,
                minlength: 8,
                equalTo: "#password"
            }

        }
        // message: {
        //     lname: "Enter your last name."
        //     },
        //     submitHandler: function () {
        //         SubForm();
        //     }





    })



})
