Scene_Login = (function (Scene) {

    var Scene_Login = function () {
        this.construct.apply(this, arguments);
    };

    $.extend(true, Scene_Login.prototype, Scene.prototype, {
        /**
         * @inheritdoc Scene#init
         */
        init: function () {
            //console.log('[Scene] init login scene');
            this.dontRedraw = true; // prevent to redraw scene
            this.userId = $("#txtLoginUserId");
            this.password = $("#txtLoginPassword");
            this.logging = false;
            this.focusCandidate = null;
        },

        /**
         * @inheritdoc Scene#create
         */
        create: function () {
            $(".login-div").hide();
            this.keepAlive = true;
            return $('#scene-login');
        },

        loginOptions: function () {

        },

        createSocket: function (data) {

        },

        resetHistory: function () {
            Router.history.shift();
        },

        /**
         * @inheritdoc Scene#activate
         */
        activate: function (config) {
            //console.log("activate");
        },

        /**
         * @inheritdoc Scene#render
         */
        render: function () {
            //console.log("render");
            this.$el.find("#loginWelcomeLabel").text(__("LoginWelcome"));
            this.$el.find("#txtLoginUserId").attr("placeholder", __("LoginUsername"));
            this.$el.find("#txtLoginPassword").attr("placeholder", __("LoginPassword"));
            this.$el.find("#btnLoginSubmit").text(__("LoginLoginButton"));

        },

        showForm: function(user, password, animated, editable) {
            $(".login-div").hide();

            $(".login-div").fadeIn(animated ? 250 : 0, function() {
                $(".login-div").show();
                $("#txtLoginUserId").val(user);
                $("#txtLoginPassword").val(password);

                if (editable) {
                    App.throbberHide();
                    $('#btnLoginSubmit').show();
                    Focus.to($("#txtLoginUserId"));
                } else {
                    App.throbber();
                    $('#btnLoginSubmit').hide();
                }
            });
        },

        destroy: function () {
            this.keepAlive = false;
            if (this.sockets) {
                Object.keys(this.sockets).forEach(function (key) {
                    this.sockets[key].close();
                }.bind(this))
            }
            this.$el.find('.login-qr .explain-steps').html('');
            this.$el.find('.login-code .explain-steps').html('');
            this.$el.find('.login-qr .code').html('');
            this.$el.find('.login-code .code').html('');
        },

        /**
         * @inheritdoc Scene#onClick
         */
        onClick: function ($el, event) {
            if (this.trigger('click', $el, event) === false) {
                return false;
            }

            return this.onEnter.apply(this, arguments);
        },

        setFocusCandidate: function($el) {
            $(".focus-candidate").removeClass("focus-candidate");
            this.focusCandidate = $el;
            if ($el != null) {
                Focus.blur($el);
                this.focusCandidate.addClass("focus-candidate");
            }
        },

        /**
         * @inheritdoc Scene#onEnter
         */
        onEnter: function ($el, event) {

            if (this.focusCandidate != null) {
                Focus.to(this.focusCandidate);
                this.setFocusCandidate(null);
                return;
            }

            if (event.target.id == "txtLoginUserId" || event.target.id == "txtLoginPassword" ) {
                this.setFocusCandidate($el);
                return;
            } else if (event.target.id == "btnLoginSubmit") {
                this.submitLogin();
                return;
            } else if ($el.isInAlertMessage(this.$el)) {
                if ($el.is(this.$nbAlertMessageOkButton)) {
                    $el.closeAlert(this.$el);
                    Focus.to(this.$lastFocused);
                }
            } else if ($el.isInAlertConfirm(this.$el)) {
                if ($el.is(this.$nbAlertConfirmOkButton)) {
                    $el.closeAlert(this.$el);
                    closeApp();
                } else if ($el.is(this.$nbAlertConfirmCancelButton)) {
                    $el.closeAlert(this.$el);
                    Focus.to(this.$lastFocused);
                }
            }
        },

        /**
         * @inheritdoc Scene#onReturn
         */
        onReturn: function ($el, event) {
            if ($el.isInAlertMessage(this.$el) || $el.isInAlertConfirm(this.$el)) {
				$el.closeAlert(this.$el);
				Focus.to(this.$lastFocused);
			} else {
				this.$lastFocused = Focus.focused;
                this.$el.showAlertConfirm(__("AppCloseApp"), 'close_app', null, null, 'cancel');
			}
        },

        /**
         * @inheritdoc Scene#navigate
         */
        navigate: function (direction) {
            var current = Focus.focused;

            if (current == null) {
                current = this.focusCandidate;
            }

            if (current == null) {
                return false;
            }

            if (current.hasClass('login-input') || current.attr('id') == 'btnLoginSubmit') {
                if (direction === 'down') {
                    if (current.attr('id') == 'txtLoginUserId') {
                        Focus.to($('#txtLoginPassword'));
                    } else if (current.attr('id') == 'txtLoginPassword') {
                        Focus.to($('#btnLoginSubmit'));
                    }
                } else if (direction === 'up') {
                    if (current.attr('id') == 'btnLoginSubmit') {
                        Focus.to($('#txtLoginPassword'));
                    } else if (current.attr('id') == 'txtLoginPassword') {
                        Focus.to($('#txtLoginUserId'));
                    }
                }

                Focus.focused.focus();

            } else if (current.isInAlertMessage(this.$el) || current.isInAlertConfirm(this.$el)) { // navigate on dialog
                this.manageFocusOnAlert(direction, current.data("parent-type"));
            }
        },

        /**
         * @inheritdoc Scene#focus
         */
        focus: function ($el) {
            if (!$el) {
                $el = this.getFocusable();
            }

            return Focus.to($el);
        },

                /**
         * Handles Focus event
         * You can overwrite me in own scene class
         *
         * @template
         * @param {Object} $el Target element, jQuery collection
         * @fires focus
         */
        onFocus: function ($el) {
            this.focusCandidate = null;
            $(".focus-candidate").removeClass("focus-candidate");
            this.trigger('focus', $el);
        },

        /**
         * Cascade focus. Manage the process of Focus delegation between snippets inside Scene
         *
         * @param {Object} Snippet or jQuery
         * @param {String} direction of Focus delegation ("up", "down", "left", "right")
         */
        // onFocusOut: function (snippet, direction) {

        // },

        submitLogin: function () {
            if (this.logging) {
                return;
            }

            var self = this;
            if (this.userId.val().length == 0) {
                console.log("Enter an user id");
            } else if (this.password.val().length == 0) {
                console.log("Enter password");
            } else {
                this.logging = true;
                App.throbber();
                cv.clientLogin(this.userId.val(), this.password.val(), true, function () {
                    cv.getClientConfig(function () { // ok
                        App.throbberHide()
                        self.userId.val("");
                        self.password.val("");
                        Router.go('licenses');
                        self.logging = false;
                    }, function () {
                        App.throbberHide()
                        self.password.val("");
                        console.log("Error getting config");
                        self.$lastFocused = Focus.focused;
                        self.$el.showAlertMessage(__("LoginWrongLogin"), 'login_wrong', null);
                        self.logging = false;
                    });
                }, function (err) {
                    App.throbberHide()
                    //self.password.val("");
                    console.log("Login error");
                    console.log(err);
                    self.$lastFocused = Focus.focused;
                    self.$el.showAlertMessage(__("LoginWrongLogin"), 'login_wrong', null);
                    self.logging = false;
                });
            }
        },

        /**
         * Handles keyDown events
         * Handling is executed only when scene has focus
         * According keyCodes here are fired right events (for navigate keys or enter event etc.) 
         * 
         * @fires beforekey
         * @fires key
         * @private
         */
        onKeyDown: function (keyCode, ev, stop) {


            if (!this.isVisible) {
                return;
            }

            if (this.trigger('beforekey', keyCode, ev) === false) {
                return false;
            }

            if (this.trigger('key', keyCode, ev) === false) {
                return false;

            } else if (keyCode === Control.key.LEFT) {
                return this.navigate('left', stop);

            } else if (keyCode === Control.key.RIGHT) {
                return this.navigate('right', stop);

            } else if (keyCode === Control.key.UP) {
                return this.navigate('up', stop);

            } else if (keyCode === Control.key.DOWN) {
                return this.navigate('down', stop);

            } else if (keyCode === Control.key.ENTER) {
                return this.onEnter(Focus.focused, ev, stop);
            } else if (keyCode === Control.key.RETURN) {
                return this.onReturn(Focus.focused, ev, stop);
            }
        }
    });

    return Scene_Login;

})(Scene);