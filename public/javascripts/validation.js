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
$(document).ready(function () {
    // Validate Username
    $("#changePassword").validate({
        rules: {
            password: {
                required: true,
                minlength: 8
            },
            passwordConfirm: {
                required: true,
                minlength: 8,
                equalTo: "#password"
            },
            oldPaaword: {
                required: true,
                minlength: 8
            }

        }
    })
})

$(document).ready(function () {
    // Validate Username
    $("#emailPhone").validate({
        rules: {
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

        }
    })
})

$(document).ready(function () {
    // Validate Username
    $("#address").validate({
        rules: {
            fastname: {
                required: true,
                minlength: 2
            },
            lastname: {
                required: true,
                minlength: 2
            },
            emailid: {
                required: true,
                email: true
            },
            mobile: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10
            },
            pincode: {
                number: true,
                required: true,
                minlength: 6,
                maxlength: 6
            },
            house: {
                required: true,
                minlength: 4
            },
            area: {
                required: true,
                minlength: 4
            },
            city: {
                required: true,
                minlength: 4
            },
            state: {
                required: true,
                minlength: 4
            },
        }
    })
})




