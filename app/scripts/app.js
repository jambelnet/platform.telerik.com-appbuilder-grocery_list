// Official 
// https://github.com/PlatformSupport/grocery-list-app-completed/blob/master/app/scripts/app.js

(function () {
    var ep = "https://api.everlive.com/v1/";
    var apiKey = "9pywi2h5n7bh6bj1";
    var el = new Everlive(apiKey);

    function baseEndPoint(target) {
        debugger;
        if (target.startsWith('/'))
            return ep + apiKey + target;
        else
            return ep + apiKey + '/' + target;
    }

    var groceryDataSource = new kendo.data.DataSource({
        type: "everlive",
        sort: {
            field: "Name", dir: "asc"
        },
        transport: {
            read: {
                url: baseEndPoint("/Groceries"),
                dataType: "json"
            },
            typeName: "Groceries"
        },
        schema: {
            data: function (response) {
                return response.Result;
            }
        }
    });

    function initialize() {
        window.loginView = kendo.observable({
            submit: function () {
                if (!this.username) {
                    navigator.notification.alert("Username is required.");
                    return;
                }
                if (!this.password) {
                    navigator.notification.alert("Password is required.");
                    return;
                }
                el.Users.login(this.username, this.password,
                    function (data) {
                        window.location.href = "#list";
                        //cordova.InAppBrowser.open('http://apache.org', '_blank', 'location=yes');
                        groceryDataSource.read(data.result);
                        // Info that is not provided in tutorial
                        // Shoud pass the callback that returns:
                        // access_token
                        // principal_id
                        // token_type
                    }, function (error) {
                        navigator.notification.alert("Unfortunately we could not find your account.");
                    });
            }
        });
        window.registerView = kendo.observable({
            submit: function () {
                if (!this.username) {
                    navigator.notification.alert("Username is required.");
                    return;
                }
                if (!this.password) {
                    navigator.notification.alert("Password is required.");
                    return;
                }
                el.Users.register(this.username, this.password, { Email: this.email },
                    function () {
                        navigator.notification.alert("Your account was successfully created.");
                        window.location.href = "#login";
                    },
                    function () {
                        navigator.notification.alert("Unfortunately we were unable to create your account.");
                    });
            }
        });
        window.passwordView = kendo.observable({
            submit: function () {
                if (!this.email) {
                    navigator.notification.alert("Email address is required.");
                    return;
                }
                $.ajax({
                    type: "POST",
                    url: baseEndPoint("/Users/resetpassword"),
                    contentType: "application/json",
                    data: JSON.stringify({ Email: this.email }),
                    success: function () {
                        navigator.notification.alert("Your password was successfully reset. Please check your email for instructions on choosing a new password.");
                        window.location.href = "#login";
                    },
                    error: function () {
                        navigator.notification.alert("Unfortunately, an error occurred resetting your password.")
                    }
                });
            }
        });
        window.addView = kendo.observable({
            add: function () {
                if (!this.grocery) {
                    navigator.notification.alert("Please provide a grocery.");
                    return;
                }
                groceryDataSource.add({ Name: this.grocery });
                groceryDataSource.one("sync", this.close);
                groceryDataSource.sync();
                //groceryDataSource.sort({ Name: this.grocery, dir: "desc" });
                this.set("grocery", "");
            },
            close: function () {
                $("#add").data("kendoMobileModalView").close();
            }
        });
        window.listView = kendo.observable({
            logout: function (event) {
                // Prevent going to the login page until the login call processes.
                event.preventDefault();
                el.Users.logout(function () {
                    this.loginView.set("username", "");
                    this.loginView.set("password", "");
                    window.location.href = "#login";
                }, function () {
                    navigator.notification.alert("Unfortunately an error occurred logging out of your account.");
                });
            }
        });
        var app = new kendo.mobile.Application(document.body, {
            skin: "nova",
            transition: "slide"
        });
        $("#grocery-list").kendoMobileListView({
            dataSource: groceryDataSource,
            template: "#: Name #"
        });
        navigator.splashscreen.hide();
    }

    document.addEventListener("deviceready", initialize);
} ());
