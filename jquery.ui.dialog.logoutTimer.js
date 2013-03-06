(function ($, window) {
    "use strict";

    $.fn.logoutTimer = function (options) {

        function log() {
            if (window.console && console.log)
                console.log('[cycle] ' + Array.prototype.join.call(arguments, ' '));
        }

        if (!$.ui) {
            log('Dependency Missing: jQuery UI');
            return;
        } else if (!$.ui.dialog) {
            log('Dependency Missing: jQuery UI Dialog');
            return;
        }

        var settings = {
            "logout": undefined,
            "title": 'Sign Out',
            "bindTo": $('body'),
            "timerContainer": "#logout-timer",
            "modalTemplate": $('<div id="logout-dialog"><p>It appears you are no longer using the website. For your safety and protection, you will be signed out of your account in less than two minutes. To continue using the website, click "Continue" below.</p><h3 id="logout-timer"></h3></div>'),
            "logoutTime": 120,
            "warningTime": 120
        };

        settings = $.extend(settings, options);

        this.each(function (i) {

            var logoutUrl = $(this).data('logout-url'),
                eventType = 'mousemove.logout',
                modalTimeout,
                warningTimeout;

            function alertLogout() {
                openModal();
                clearLogoutTimer();
                settings.bindTo.unbind(eventType);
            }

            function startLogoutTimer() {
                modalTimeout = setTimeout(alertLogout, 1000 * settings.logoutTime);
            }

            function clearLogoutTimer() {
                clearTimeout(modalTimeout);
            }

            function resetTimer() {
                clearLogoutTimer();
                startLogoutTimer();
            }

            function logout() {
                if (settings.logout)
                    settings.logout();
                else if (logoutUrl)
                    window.location.href = logoutUrl;
            }

            function logoutTimer() {
                var timerIncrement = 0;
                var count = settings.warningTime;
                var timer = function () {
                    count = count - 1;
                    if (count <= 0) {
                        clearInterval(warningTimeout);
                        logout();
                        return;
                    }
                    $(settings.timerContainer).text(secondstotime(count));
                };
                warningTimeout = setInterval(timer, 1000); //1000 will  run it every 1 second
            }

            function beforeClosingModal() {
                clearInterval(warningTimeout);
                settings.bindTo.on(eventType, resetTimer);
            }

            function onModalContinue() {
                $(this).dialog("close");
            }

            function openModal() {
                logoutTimer();
                settings.modalTemplate.dialog({
                    modal: true,
                    title: settings.title,
                    beforeClose: beforeClosingModal,
                    buttons: { "Continue": onModalContinue }
                });
            }

            function secondstotime(secs) {
                var t = new Date(1970, 0, 1);
                t.setSeconds(secs);
                var s = t.toTimeString().substr(3, 5);
                if (secs > 86399)
                    s = Math.floor((t - Date.parse("1/1/70")) / 3600000) + s.substr(2);
                return s;
            }

            settings.bindTo.on(eventType, resetTimer).trigger(eventType);
        });

        return this;
    };

    $('a.logout').logoutTimer();

})(jQuery, window);
