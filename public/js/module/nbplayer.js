var nbControlsEnum = {
    fullscreen: "vjs-fullscreen-control",
    audio: "vjs-audio-button",
    text: "vjs-subs-caps-button",
    trackItem: "vjs-menu-item"
}

$(function () {
    nbPlayer.init();
});

var nbPlayer = {
	name: 'nb-vjs',
    currentType: null,
    vodControlsEnum: null,
    type: {
        vod: "vod",
        service: "service",
        catchup: "catchup-event"
    },
    $player: null,
    $controlBar: null,
    $playPauseButton: null,
    $playIcon: null,
    $pauseIcon: null,
    $vodControls: null,
    $vodTracksDiv: null,
    $vodTracksButton: null,
    $nextEpisodeButton: null,
    $nextEpisodeButtonTooltip: null,
    $forwardXButton: null,
    $backXButton: null,
    $goToStartButton: null,
    $goToEpgButton: null,
    //$seekingButton: null,
    $nbControlBar: null,
    $seekbar: null,
    $seekbarBar: null,
    $itemImageImg: null,
    $itemImageDiv: null,
    $channel: null,
    $epgNowLabel: null,
    $epgNowTimeLabel: null,
    $epgNextLabel: null,
    $titleTopLabel: null,
    $epgDataTr: null,
    $seekbarCurrentTime: null,
    $seekbarLeftTime: null,
    $backButton: null,
    resetDelay: null,
    inactivityTimeout: null,
    defaultSkipSeconds: 10,
    startTime: null,
    endTime: null,
    duration: null,
    lastTime: 0,
    currentPercent: 0,
    isLive: false,
    callbackOnEnded: null,
    currentBrand: "",
	init: function(successCallback) {

        this.currentBrand = CONFIG.app.brand;
        this.$container = $("#divVideoContainer");
        this.$player = videojs('mainVideo');
        this.$playerDiv = $(this.$player.el_);

        this.vodControlsEnum = {
            play: "nb-vjs-play-pause-button",
            next: "nb-vjs-next-button",
            tracks: "nb-vjs-tracks-button",
            back: "nb-vjs-back-button",
            trackItem: "nb-vjs-track-item",
            forwardX: 'nb-vjs-forwardx-button',
            backX: 'nb-vjs-backx-button',
            start: 'nb-vjs-start-button',
            end: 'nb-vjs-end-button',
            epg: 'nb-vjs-epg-button',
        }

        // set initial player dimensions based on screen height
        var height = $(window).height() * 0.3;
        var width = (16/9 - 1) * height + height;
        this.$container.width(width);
        this.$container.height(height);
        this.$container.parent().height(height + 5);
        this.$container.parent().parent().height(height + 5);
        this.$container.find("#mainVideo").css({"width": "100%", "height": "100%"});

        this.$container.find("#mainVideo").prepend("<div class='channel-number-indicator'><span></span></div>");

        this.$player.options_.inactivityTimeout = 0;
        this.$controlBar = this.$playerDiv.find(".vjs-control-bar:first");
        this.$controlBar.addClass(".hide-controls");
        this.$controlBar.find(".vjs-remaining-time").hide();

        //init VOD controls
        this.$controlBar.append($("#nbVjsControlsTemplate").html());
        $("#nbVjsControlsTemplate").remove();

        //this.$seekbar = this.$controlBar.find(".vjs-play-progress:first");
        this.$seekbar = this.$controlBar.find(".nb-seekbar:first");
        this.$seekbarBar = this.$seekbar.find("div:first");
        this.$itemImageDiv = this.$controlBar.find(".vjs-nb-item-image:first");
        this.$itemImageImg = this.$itemImageDiv.find("img:first");
        this.$vodControls = this.$controlBar.find(".nb-vjs-vod-controls");
        this.$playPauseButton = this.$controlBar.find(".nb-vjs-play-pause-button:first");
        this.$playIcon = this.$playPauseButton.find("svg[data-type='play']");
        this.$pauseIcon = this.$playPauseButton.find("svg[data-type='pause']");
        this.$vodTracksDiv = this.$vodControls.find(".nb-vjs-tracks-div");
        this.$vodTracksButton = this.$vodControls.find(".nb-vjs-tracks-button");
        this.$nextEpisodeButton = this.$vodControls.find(".nb-vjs-next-button");
        this.$nextEpisodeButtonTooltip = this.$vodControls.find(".nb-vjs-next-button-tooltip");
        this.$forwardXButton = this.$vodControls.find(".nb-vjs-forwardx-button");
        this.$backXButton = this.$vodControls.find(".nb-vjs-backx-button");
        this.$goToStartButton = this.$vodControls.find(".nb-vjs-start-button");
        this.$goToEndButton = this.$vodControls.find(".nb-vjs-end-button");
        this.$goToEpgButton = this.$vodControls.find(".nb-vjs-epg-button");
        // this.$seekingButton = this.$vodControls.find(".vjs-mouse-display");
        this.$epgNowLabel = this.$vodControls.find(".nb-vjs-epg-now:first");
        this.$epgNowTimeLabel = this.$vodControls.find(".nb-vjs-epg-now-time:first");
        this.$epgNextLabel = this.$vodControls.find(".nb-vjs-epg-next:first");
        this.$titleTopLabel = this.$vodControls.find(".nb-vjs-vod-title:first");
        this.$epgDataTr = this.$vodControls.find(".nb-vjs-epg-data-tr:first");
        this.$seekbarCurrentTime = this.$controlBar.find(".nb-vjs-vod-current-time:first");
        this.$seekbarLeftTime = this.$controlBar.find(".nb-vjs-vod-duration:first");
        this.$backButton = this.$controlBar.find(".nb-vjs-back-button:first");

        var self = this;
        this.$player.on("pause", function() {
            self.$pauseIcon.hide();
            self.$playIcon.show();
        })

        this.$player.on("play", function() {
            self.$playIcon.hide();
            self.$pauseIcon.show();
        });

        //set default texts and values
        this.$vodControls.find(".nb-vjs-tracks-subtitles-title").html(__("PlayerTracksSubtitlesTitle"));
        this.$nextEpisodeButtonTooltip.html(__("PlayerNextEpisodeTooltip"));
        this.$vodControls.find(".nb-vjs-backx-button-tooltip").html(__("PlayerBackXButtonTooltip"));
        this.$vodControls.find(".nb-vjs-forwardx-button-tooltip").html(__("PlayerForwardXButtonTooltip").replaceAll("%s", this.defaultSkipSeconds));
        this.$vodControls.find(".nb-vjs-start-button-tooltip").html(__("PlayerStartButtonTooltip"));
        this.$vodControls.find(".nb-vjs-end-button-tooltip").html(__("PlayerEndButtonTooltip"));
        this.$vodControls.find(".nb-vjs-tracks-audio-title").html(__("PlayerTracksAudioTitle"));
        this.$vodControls.find(".nb-vjs-tracks-subtitles-title").html(__("PlayerTracksSubtitlesTitle"));
        this.$vodControls.find(".nb-vjs-epg-button-tooltip").html(__("EPGTitle"));
        $(".vjs-menu-item").addClass("focusable");

        this.$player.on('fullscreenchange', function() {
            setTimeout(function() {
                if (self.isFullscreen()) {
                    $(self.$player.el_).find(".video-cover").hide();
                } else {
                    $(self.$player.el_).find(".video-cover").show();
                    self.hideControls();
                }
            }, 800);
        });

        this.$playerDiv.parent().prepend('<div class="video-cover"></div>');

        if (successCallback != null && typeof successCallback != 'undefined') {
            successCallback();
        }

        this.$seekbar.click(function (e){
            var newPercent = ((e.pageX - $(this).offset().left) / $(this).width());
            self.seekbarClicked(newPercent);
        });

        //hide original controls
        $(".vjs-progress-control").hide();
        $(".vjs-control-bar>div,.vjs-control-bar>button").css({"visibility": "hidden"});
        this.$controlBar.find(".vjs-subs-caps-button").css({"visibility": "hidden"});
        this.$controlBar.find(".vjs-audio-button").css({"visibility": "hidden"});
        this.$controlBar.find(".vjs-current-time").css({"visibility": "hidden"});
        this.$controlBar.find(".vjs-duration").css({"visibility": "hidden"});

        this.$controlBar.addClass("nb-vjs-custom-controls-div");
        this.$vodControls.css({"visibility": "visible"});
        this.$vodControls.show();

        if (this.currentBrand == "fotelka") {
            this.$backButton.closest("td").html(this.$goToEpgButton.closest("td").html());
            this.$goToEpgButton.closest("td").html(this.$vodTracksButton.closest("td").html());
            this.$vodTracksButton.closest("td").empty();
            this.$vodTracksButton = this.$vodControls.find(".nb-vjs-tracks-button");
        }
	},

    requestFullscreen: function() {
        try {
            var self = this;
            this.$player.requestFullscreen();
            setTimeout(function() {
                self.showControls();
            }, 100);
        } catch(e){}
    },

    isPaused: function() {
        return this.$player.paused();
    },

    navigate: function($focused, direction) {
        var $current = $focused;

        var $nbPlayerControlsBar = $(".vjs-control-bar");
        var $focusContainer = $current.closest("div[class^='nb-vjs']");

        if ($focusContainer.length > 0) {
            var $focusTo = [];
            var $nbVjsList = [];

            if ($current.is(this.$seekbar)) {
                if (direction == "left") {
                    this.backXAction();
                } else if (direction == "right") {
                    this.forwardXAction();
                } else if (direction == "up") {
                    if (this.$playPauseButton.is(":visible")) {
                        $focusTo = this.$playPauseButton;
                    } else {
                        $focusTo = this.$backButton;
                    }
                }
            } else if ($current.hasClass("nb-vjs-track-item")) {
                $focusTo = this.navigateTracks($current, direction);
            } else if ($current.closest("tr").index() == 0 && (direction == "down")) {
                var $nbPlayButton = $nbPlayerControlsBar.find(".nb-vjs-play-pause-button");

                if (this.$playPauseButton.is(":visible")) {
                    $focusTo = this.$playPauseButton;
                } else if (this.$seekbar.is(":visible")) {
                    $focusTo = this.$seekbar;
                }
            } else {
                if (direction == "left") {
                    $nbVjsList = $current.closest("td").prevAll("td:visible");
                } else if (direction == "right") {
                    $nbVjsList = $current.closest("td").nextAll("td:visible");
                } else if (direction == "up") {
                    $nbVjsList = $current.closest("td").parent().prevAll("tr:visible");
                } else if (direction == "down") {
                    $nbVjsList = $current.closest("td").parent().nextAll("tr:visible");
                }

                if ($nbVjsList != null && $nbVjsList.length > 0) {
                    $nbVjsList.each(function(idx, item) {
                        var focusable = $(item).find(".focusable:first:visible");
                        if (focusable.length > 0) {
                            $focusTo = focusable;
                            return false;
                        }
                    });
                }
            }

            if ($focusTo.length > 0) {
                $(".nb-vjs-tooltip").hide();
                Focus.to($focusTo);
            }

            this.resetAutoHideControls();
            return;
        }

        this.resetAutoHideControls();
    },

    manageOnEnter: function($el, callbackNext, callbackRestartFocus, callbackGoToEpg) {
        if (!this.nbPlayerAreControslActive()) {
            this.showControls();
            this.focusOnFirstElement();
        } else {

            if (this.vodPlayerGetControlType($el) != this.vodControlsEnum.trackItem) {
                this.closeTracks();
            }

            switch (this.vodPlayerGetControlType($el)) {
                case this.vodControlsEnum.play:
                    if (this.isPaused()) {
                        this.$player.play();
                    } else {
                        this.$player.pause();
                    }
                    break;
                case this.vodControlsEnum.next:
                    callbackNext();
                    break;
                case this.vodControlsEnum.tracks:
                    var $first = this.openTracks();
                    if ($first.length > 0) {
                        Focus.to($first);
                    }
                    break;
                case this.vodControlsEnum.back:
                    var self = this;
                    this.exitFullscreen(function() {
                        //self.restartFocus();
                        callbackRestartFocus();
                    });
                    break;
                case this.vodControlsEnum.trackItem:
                    this.selectTrack($el);
                    break;
                case this.vodControlsEnum.backX:
                    this.backXAction();
                    break;
                case this.vodControlsEnum.forwardX:
                    this.forwardXAction();
                    break;
                case this.vodControlsEnum.start:
                    this.start();
                    break;
                case this.vodControlsEnum.end:
                    this.end();
                    break;
                case this.vodControlsEnum.epg:
                    this.exitFullscreen(function() {
                        callbackGoToEpg();
                    });
                    break;
            }
        }
    },

    playContent: function(type, url) {
        var self = this;
        this.$player.pause();
        this.nbPlayerResetContent();
        this.currentType = type;
        this.isLive = this.currentType == "service";
        this.$player.src({
            src: url,
            type: 'application/x-mpegURL',
            //src: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8"
            //src: "http://190.171.101.36/AXN/index.m3u8"
            //src: "https://news.cgtn.com/resource/live/english/cgtn-news.m3u8"
            //src: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
        });

        //this.showVODControls();

        this.$controlBar.addClass("nb-vjs-custom-controls-div");
        this.$vodControls.css({"visibility": "visible"});
        this.$vodControls.show();

        this.seekbarLiveInitialTime = 0;
        this.seekbarLiveInitialDate = null;
        this.seekbarLiveSecondsLate = 0;
        this.$player.on('loadeddata', function() {
            self.playerLoaded();
        });

        //prepare controls
        this.$vodTracksButton.hide();
        if (this.isLive && this.currentBrand != "bromteck" && this.currentBrand != "cablesatelite") {
            this.$playPauseButton.hide();
            this.$backXButton.hide();
            this.$forwardXButton.hide();
            this.$goToStartButton.hide();
            this.$goToEndButton.hide();
        } else {
            this.$playPauseButton.hide();
            this.$backXButton.show();
            this.$forwardXButton.show();
            this.$goToStartButton.show();
            this.$goToEndButton.show();
        }

        if (this.isLive) {
            this.$seekbar.removeClass("focusable");
            this.$seekbar.css("pointer-events", "none");
        } else {
            this.$seekbar.addClass("focusable");
            this.$seekbar.css("pointer-events", "auto");
        }
    },

    playerLoaded: function() {

        this.seekbarLiveInitialTime = this.$player.currentTime();
        this.seekbarLiveInitialDate = this.getCurrentServerTime();
        //check if has tracks (audio or subtitle) to show button
        if (this.$player.audioTracks().length > 0 || this.$player.textTracks().length > 0) {
            this.$vodTracksButton.show();
        } else {
            this.$vodTracksButton.hide();
        }
    },

    setPlayerMetadata: function(metadata) {
        label = "";
        label = (metadata.titleTop && metadata.titleTop.length > 0) ? metadata.titleTop : "";
        this.$titleTopLabel.html(metadata.titleTop);

        label = __("EPGAtThisTime") + ": " + ((metadata.epgNow && metadata.epgNow.length > 0) ? metadata.epgNow : __("EPGNoInformation"));
        this.$epgNowLabel.html(label);
        label = __("EPGNext") + ": " + ((metadata.epgNext && metadata.epgNext.length > 0) ? metadata.epgNext : __("EPGNoInformation"));
        this.$epgNextLabel.html(label);

        if (metadata.showNext) {
            this.$nextEpisodeButton.show();
        } else {
            this.$nextEpisodeButton.hide();
        }

        this.$epgDataTr.hide();
        this.$playPauseButton.parent().parent().show();
        this.$seekbar.parent().parent().show();

        if (this.isLive) {
            if (metadata.epgImageStyle && metadata.epgImageStyle.length > 0) {
                this.$itemImageImg.attr("style", metadata.epgImageStyle);
            }

            this.$itemImageImg.loadImage(metadata.epgImageSrc, metadata.epgImagePlaceholder);
            //this.$itemImageImg.attr("style", "visibility: visible");

            if (metadata.startTime != null && metadata.endTime != null) {
                this.startTime = metadata.startTime;
                this.endTime = metadata.endTime;
                this.duration = getTimeDifference(metadata.startTime, metadata.endTime, 'seconds');
                this.$seekbarBar.css({"width": "0%"});
                /*var now = this.getCurrentServerTime();
                var current = getTimeDifference(metadata.startTime, now, 'seconds');
                var percent = current/this.duration * 100;
                this.$seekbar.css({"width": percent + "%"});*/
                this.$epgNowTimeLabel.html(getDateFormatted(this.startTime, true) + " - " + getDateFormatted(this.endTime, true));
                this.onProgressLiveContent()
                this.$epgDataTr.show();
            } else {
                this.$playPauseButton.parent().parent().hide();
                this.$seekbar.parent().parent().hide();
            }
        }

        $(".vjs-progress-control").hide();
        $(".nb-vjs-tooltip").hide();
    },

    vodPlayerGetControlType: function($object) {
        if ($object.hasClass(this.vodControlsEnum.play)) {
            return this.vodControlsEnum.play;
        } else if ($object.hasClass(this.vodControlsEnum.next)) {
            return this.vodControlsEnum.next;
        } else if ($object.hasClass(this.vodControlsEnum.tracks)) {
            return this.vodControlsEnum.tracks;
        } else if ($object.hasClass(this.vodControlsEnum.back)) {
            return this.vodControlsEnum.back;
        } else if ($object.hasClass(this.vodControlsEnum.trackItem)) {
            return this.vodControlsEnum.trackItem;
        } else if ($object.hasClass(this.vodControlsEnum.forwardX)) {
            return this.vodControlsEnum.forwardX;
        } else if ($object.hasClass(this.vodControlsEnum.backX)) {
            return this.vodControlsEnum.backX;
        } else if ($object.hasClass(this.vodControlsEnum.start)) {
            return this.vodControlsEnum.start;
        } else if ($object.hasClass(this.vodControlsEnum.end)) {
            return this.vodControlsEnum.end;
        } else if ($object.hasClass(this.vodControlsEnum.epg)) {
            return this.vodControlsEnum.epg;
        }

        return false;
    },

	openTracks: function() {

        var tracks = "";
        if (this.$player.textTracks().length > 0 || this.$player.audioTracks().length > 0) {
            var maxIndex = this.$player.audioTracks().length > (this.$player.textTracks().length + 1) ? this.$player.audioTracks().length : (this.$player.textTracks().length + 1);
            var subitlesDeactivated = this.$player.textTracks().tracks_.filter(function(track) { return track.mode == "showing" }).length == 0;
            var activated = "";
            var label = "";

            for (var i = 0; i < maxIndex ; i++) {
                tracks += "<tr>";

                // audio
                if (i < this.$player.audioTracks().length) {
                    activated = this.$player.audioTracks().tracks_[i].enabled ? "" : "hidden";
                    label = this.$player.audioTracks().tracks_[i].label != null ? this.$player.audioTracks().tracks_[i].label : "";
                    label = label == "" ? __("PlayerTracksUnknown") : label;
                    tracks += "<td class='nb-vjs-track-audio'><span class='focusable nb-vjs-track-item' data-index='" + i + "'> <i class='fa fa-check " + activated + "'></i>" + label + "</span></td>";
                } else {
                    tracks += "<td></td>";
                }

                // subtitles
                if (i == 0 && this.$player.textTracks().length > 0) {
                    activated = subitlesDeactivated ? "" : "hidden";
                    tracks += "<td class='nb-vjs-track-subtitle'><span class='focusable nb-vjs-track-item' data-index='-1'> <i class='fa fa-check " + activated + "'></i>" + __("PlayerSubtitlesDeactivated") + "</span></td>";
                } else if ((i - 1) < this.$player.textTracks().length && this.$player.textTracks().tracks_[i-1] != null) {
                    label = this.$player.textTracks().tracks_[i-1].label != null ? this.$player.textTracks().tracks_[i-1].label : "";
                    label = label == "" ? __("PlayerTracksUnknown") : label;

                    activated = (this.$player.textTracks().tracks_[i-1].mode == "showing") ? "" : "hidden";
                    tracks += "<td class='nb-vjs-track-subtitle'><span class='focusable nb-vjs-track-item' data-index='" + (i-1) + "'> <i class='fa fa-check " + activated + "'></i>" + label + "</span></td>";
                } else {
                    tracks += "<td></td>";
                }

                tracks += "</tr>";
            }
        }

        if (tracks.length > 0) {
            this.$vodTracksDiv.find("table tbody").html(tracks);

            var subtitles = this.$vodTracksDiv.find("table tbody .nb-vjs-track-subtitle");
            if (subtitles.length > 0) {
                this.$vodTracksDiv.find("table .nb-vjs-track-subtitle").show();
                this.$vodTracksDiv.find("table tbody tr").find("td:eq(1)").show();
            } else {
                this.$vodTracksDiv.find("table .nb-vjs-track-subtitle").hide();
                this.$vodTracksDiv.find("table tbody tr").find("td:eq(1)").hide();
            }

            var audios = this.$vodTracksDiv.find("table tbody .nb-vjs-track-audio");
            if (audios.length > 0) {
                this.$vodTracksDiv.find("table .nb-vjs-track-audio").show();
                this.$vodTracksDiv.find("table tbody tr").find("td:eq(0)").show();
            } else {
                this.$vodTracksDiv.find("table .nb-vjs-track-audio").hide();
                this.$vodTracksDiv.find("table tbody tr").find("td:eq(0)").hide();
            }

            this.$vodTracksDiv.show();
            return this.$vodTracksDiv.find("table tbody tr td .focusable:first");
        } else {
            this.$vodTracksDiv.find("table tbody").html("");
            this.$vodTracksDiv.hide();
            this.$vodTracksButton.hide();
            return [];
        }
	},

    closeTracks: function() {
        this.$vodTracksDiv.hide();
    },

    navigateTracks: function($focused, direction) {
        var $focusTo = [];
        switch (direction) {
            case 'right':
                $focusTo = $focused.closest("td").next("td").find(".focusable");
                break;
            case 'left':
                $focusTo = $focused.closest("td").prev("td").find(".focusable");
                break;
            case 'up':
                $focusTo = $focused.closest("tr").prev("tr").find("td").eq($focused.closest("td").index()).find(".focusable");
                break;
            case 'down':
                $focusTo = $focused.closest("tr").next("tr").find("td").eq($focused.closest("td").index()).find(".focusable");
                break;
            default:
                break;
        }

        return $focusTo;
    },

    selectTrack: function($focused) {
        var index = $focused.data("index");

        if ($focused.closest("td").hasClass("nb-vjs-track-subtitle")) {
            this.$player.textTracks().tracks_.forEach(function(track,index) { if(track.mode == "showing") {track.mode = "hidden";} })
            if (index >= 0) {
                this.$player.textTracks().tracks_[index].mode = "showing";
            }

            this.$vodTracksDiv.find(".nb-vjs-track-subtitle .focusable i").addClass("hidden");
        } else {
            this.$player.audioTracks().tracks_.forEach(function(track,index) { if(track.enabled == true) {track.mode = false;} })
            this.$player.audioTracks().tracks_[index].enabled = true;
            this.$vodTracksDiv.find(".nb-vjs-track-audio .focusable i").addClass("hidden");
        }

        $focused.closest("span").find("i").removeClass("hidden");
    },

    resetAutoHideControls: function() {
        var self = this;
        clearTimeout(this.inactivityTimeout);
        this.inactivityTimeout = setTimeout(function(){
            self.hideControls();
        }, 6000);
    },

    showControls: function() {
        this.$player.userActive(true);
        this.resetAutoHideControls();
        $(".nb-vjs-tooltip").hide();
        //$(".nb-vjs-custom-controls-div").show();
        this.focusOnFirstElement();
    },

    hideControls: function() {
        var self = this;
        this.closeTracks();
        $(".vjs-menu").hide();
        // this.cancelSeekTimeIndicator();
        $(".nb-vjs-tooltip").hide();
        setTimeout(function() {
            self.$player.userActive(false);
        }, 100);
        //$(".nb-vjs-custom-controls-div").hide();
    },

    backXAction: function() {
        this.skip(-this.defaultSkipSeconds);
    },

    forwardXAction: function() {
        this.skip(this.defaultSkipSeconds);
    },

    start: function() {
        if (this.isLive) {
            this.goToStartLive();
        } else {
            this.$player.currentTime(0);
        }
    },

    end: function() {
        if (this.isLive) {
            this.goToLivePoint();
        } else {
            this.$player.currentTime(this.$player.duration() - this.defaultSkipSeconds);
        }
    },

    skip: function(seconds) {
        if (this.isLive) {
            this.skipTimeLive(seconds);
        } else {
            this.$player.currentTime(this.$player.currentTime() + seconds);
        }

        this.resetAutoHideControls();
    },

    nbPlayerResetContent: function(minimize) {
        this.hideControls();

        if (minimize && this.isFullscreen()) {
            this.exitFullscreen(function(){});
        }

        this.$player.errorDisplay.close();
        this.$player.reset();
        this.$player.hasStarted(false);
        this.$player.currentTime(0);
        this.currentPercent = 0;
        this.isLive = false;
        this.startTime = null;
        this.endTime = null;
        this.duration = null;
        this.callbackOnEnded = null;
    },

    nbPlayerAreControslActive: function() {
        return this.$player && this.$player.userActive();
    },

    exitFullscreen: function(callback) {
        this.hideControls();
        this.$player.exitFullscreen();
        callback();
    },

    onReturn: function($el, playbackMetadata, callback) {
        if (this.nbPlayerAreControslActive()) {
            if (playbackMetadata.type == "vod") {
                if (this.vodPlayerGetControlType($el) == this.vodControlsEnum.trackItem) {
                    this.closeTracks();
                    Focus.to(this.$vodTracksButton);
                } else {
                    this.hideControls();
                }
            } else {
                this.hideControls();
            }
        } else {
            // this.cancelSeekTimeIndicator();
            this.exitFullscreen(callback);
        }
    },

    isFullscreen: function() {
        return this.$player.isFullscreen_;
    },

    setTextTrack(index) {

        var tracks = this.$player.textTracks();

        for (var i = 0; i < tracks.length; i++) {
            tracks[i].mode = 'hidden';
        }

        if (index > 1) {
            this.$player.textTracks()[index - 2].mode = "showing";
        }
    },

    setAudioTrack(index) {
        if (index < this.$player.audioTracks().length) {
            this.$player.audioTracks()[index].enabled = true;
        }
    },

    getControlType: function($object) {
        if ($object.hasClass(this.vodControlsEnum.fullscreen)) {
            return this.vodControlsEnum.fullscreen;
        } else if ($object.hasClass(this.vodControlsEnum.audio)) {
            return this.vodControlsEnum.audio;
        } else if ($object.hasClass(this.vodControlsEnum.text)) {
            return this.vodControlsEnum.text;
        } else if ($object.hasClass(this.vodControlsEnum.trackItem)) {
            return this.vodControlsEnum.trackItem;
        }

        return false;
    },

    onProgressEverySecond(time) {
        if (time == this.lastTime) {
            return;
        }

        this.lastTime = time;

        if (this.isLive) {
            this.onProgressLiveContent();
        } else {
            this.onProgressVOD(time);
        }
    },

    onProgressLiveContent: function() {

        if (this.startTime == null || this.endTime == null || this.duration == 0 || this.seekbarLiveInitialDate == null) {
            return;
        }

        var now = this.getCurrentLiveProgressTime();
        var currentSeconds = getTimeDifference(this.startTime, now, 'seconds');
        this.currentPercent = currentSeconds / this.duration * 100;

        if (this.currentPercent <= 100) {
            this.$seekbarBar.css({"width": this.currentPercent + "%"});
            //this.$seekbarBar.find("div:last").html(getStringDate(now, "HH:mm:ss") + " (" + parseInt(this.currentPercent) + "%)");
            this.$seekbarCurrentTime.html(secondsToTimeString(currentSeconds));
            this.$seekbarLeftTime.html(secondsToTimeString(getTimeDifference(now, this.endTime, 'seconds')));
        } else {
            if (this.callbackOnEnded != null) {
                this.callbackOnEnded();
            }
        }
    },

    onProgressVOD: function(time) {
        var duration = this.$player.duration();

        if (duration <= 0) {
            return;
        }

        this.currentPercent = time / duration * 100;
        if (this.currentPercent > 100) {
            return;
        }

        this.$seekbarBar.css({"width": this.currentPercent + "%"});
        this.$seekbarCurrentTime.html(secondsToTimeString(time));
        this.$seekbarLeftTime.html(secondsToTimeString(duration - time));
    },

    /**
     * Returns the current progress of live content in date (moment) format
     * @returns Date (moment)
     */
    getCurrentLiveProgressTime: function() {
        var diffNow = getTimeDifference(this.seekbarLiveInitialDate, this.getCurrentServerTime(), 'seconds') - this.seekbarLiveSecondsLate;
        var now = addSeconds(this.seekbarLiveInitialDate, diffNow);
        console.log(" now: " + now);

        return now;
    },

    setEvents(callbackOnProgress, callbackOnError, callbackOnEnded) {
        var self = this;

        this.$player.off('timeupdate');
        this.$player.on('timeupdate', function(event){
            var time = parseInt(self.$player.currentTime());
            self.onProgressEverySecond(time);
            callbackOnProgress(time);
        });

        this.$player.off('error');
        this.$player.on('error', function(error) {
            callbackOnError(error);
        });

        if (this.isLive) {
            this.callbackOnEnded = callbackOnEnded;
        } else {
            this.$player.off('ended');
            this.$player.on('ended', function() {
                callbackOnEnded();
            });
        }
    },

    goToLivePoint: function() {
        this.seekbarLiveSecondsLate = 0;
        this.$player.currentTime(this.getLiveCurrentTime());
    },

    goToStartLive: function() {
        var secondsNow = getTimeDifference(this.startTime, this.seekbarLiveInitialDate, 'seconds');
        var newTime = this.seekbarLiveInitialTime - secondsNow;
        this.seekbarLiveSecondsLate = getTimeDifference(this.startTime, getTodayDate(), 'seconds');
        this.$player.currentTime(newTime);
    },

    getLiveCurrentTime: function() {
        var diff = getTimeDifference(this.seekbarLiveInitialDate, this.getCurrentServerTime(), 'seconds');

        return this.seekbarLiveInitialTime + diff;
    },

    getCurrentServerTime: function() {
        return getTodayDate();
    },

    /**
     *
     * @param {int} newPercent: value between 0 and 1
     */
    seekbarClicked: function(newPercent) {

        if (this.isLive) {
            var current = (newPercent * this.duration);
            var newPointDate = addSeconds(this.startTime, current);
            var now = this.getCurrentServerTime();
            var diffNow = getTimeDifference(this.seekbarLiveInitialDate, now, 'seconds');
            var newSecondsLate = getRealTimeDifference(newPointDate, now, 'seconds');

            if ((this.seekbarLiveInitialTime + diffNow + newSecondsLate) <= this.getLiveCurrentTime()) {
                this.seekbarLiveSecondsLate = Math.abs(newSecondsLate);
                newPercent *= 100;
                this.$seekbarBar.css({"width": newPercent + "%"});

                this.$player.currentTime(this.seekbarLiveInitialTime + diffNow - this.seekbarLiveSecondsLate);
            } else {
                this.goToLivePoint();
            }
        } else {

            var duration = this.$player.duration();
            if (duration <= 0) {
                return;
            }

            var newSeconds = (newPercent * duration);

            if (newSeconds >= 0 && newSeconds <= duration) {
                this.$player.currentTime(newSeconds);
            }
        }

    },

    skipTimeLive: function(seconds) {

        var sec = (this.currentPercent * this.duration) / 100;
        sec += seconds;
        var newPercent = sec / this.duration;

        this.seekbarClicked(newPercent);
    },

    focusOnFirstElement: function() {
        if (this.$playPauseButton.is(":visible")) {
            Focus.to(this.$playPauseButton);
        } else {
            var $to = this.$controlBar.find(".focusable:visible:first");

            if ($to.length > 0) {
                Focus.to($to);
            }
        }
    }
};
