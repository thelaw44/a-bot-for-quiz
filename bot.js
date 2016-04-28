// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.quizup.com/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var CURRENTSTATE = 0;
    var PLAYBUTTONSTATE = 1;
    var INGAME = 2;
    var GAMEENDED = 3;
    var POSTGAMEENDED = 4;
    var HOMEPAGE = 5;
    var GAMEINIT = 6;

    var botStarted = false;

    var lastQuestion = "";
    var questionsFound = 0;
    var questionsKnew = 0;

    $("body").prepend('<div class="bot-ui" style="position: absolute;width: 200px;top: 0;left: 0;height: 400px;background-color: black;color: green;z-index: 9999999;padding-top: 20px;text-align: center;line-height: 25px;"><div class="botstate">HOMEPAGE</div><hr><div class="questionCount">Recorded Questions:<span class="qCount">32</span></div><hr><button id="ststop">Start</button><hr><div class="qIndentified">False</div><hr><div class="ansState">Not Ready</div><hr><div class="knowledge">0/0</div></div>');
    $("#ststop").click(function(){
        if(botStarted){
            $("#ststop").html("Start");
        }else{
            $("#ststop").html("Stop");
        }
        botStarted = !botStarted;
    });

    var _stateDetector = setInterval(function(){
        var tempState = 0;
        if($(".TopicHeader__header").length > 0 ){
            tempState = HOMEPAGE;
        }
        if($(".ChallengeGame").length > 0 ){
            tempState = GAMEINIT;
        }
        if($(".PlayRandomButton__icon").length > 0){
            tempState = PLAYBUTTONSTATE;
        }
        if($(".QuestionScene__timer__text").length > 0 ){
            tempState = INGAME;
        }
        if($(".EndGameHeader__title").length > 0){
            tempState = GAMEENDED;
        }
        if($(".EndGameResultsActions__button--play").length > 0){
            tempState = POSTGAMEENDED;
        }
        CURRENTSTATE = tempState;
        _worker();
    },500);

    var _worker = function(){
        switch(CURRENTSTATE){
            case PLAYBUTTONSTATE:
                $(".botstate").text("Play Button");
                if(botStarted){
                    $(".PlayRandomButton span").click();
                }
                break;
            case INGAME:
                if($(".Answer--correct").length > 0){
                    localStorage.setItem($(".Question__text").text(), $(".Answer--correct").text());
                }else{
                    if(botStarted){
                        var roundMultiplier = 2;
                        var timeRemains = parseInt($(".QuestionScene__timer__value").text());
                        var myScore = parseInt($(".QuestionScene__profile__score").eq(0).text());
                        var enemyScore = parseInt($(".QuestionScene__profile__score").eq(1).text());

                        if(lastQuestion != $(".Question__text").text() && $(".Question__text") && $(".Question__text").text().length > 5){

                            questionsFound++;
                            lastQuestion = $(".Question__text").text();
                            if(localStorage.getItem($(".Question__text").text())){
                                questionsKnew++;
                            }
                            $(".knowledge").text(questionsKnew + "/" + questionsFound);
                        }
                        if($(".Question__text").text() && $(".Question__text") && $(".Question__text").text().length > 5){
                            if(myScore > enemyScore + 25){
                                /* Random Answer */
                                $(".ansState").text("Huge win, random answering");
                                randomAnswer();
                            }else{
                                if(localStorage.getItem($(".Question__text").text())){
                                    $(".qIndentified").text(localStorage.getItem($(".Question__text").text()));
                                    if(enemyScore > myScore){
                                        /* Answer Fast To Catch */
                                        $(".ansState").text("Trying to catch him, know the answer");
                                        answerFromLocal();
                                    }else{
                                        /* Answer Calm To Not Get Detected */

                                        if(timeRemains > 5){
                                            $(".ansState").text("Waiting for calm answer over 5 seconds");
                                            if((timeRemains-1) * roundMultiplier + myScore < enemyScore){
                                                answerFromLocal();
                                            }
                                        }else{
                                            $(".ansState").text("Minimum time answer reached");
                                            answerFromLocal();
                                        }
                                    }
                                }else{
                                    /* Random Answer */
                                    $(".qIndentified").text(":(");
                                    $(".ansState").text("Don't know the question random answering");
                                    randomAnswer();
                                }
                            }
                        }
                    }
                }
                break;
            case GAMEENDED:
                $(".botstate").text("Game Ended");
                if(botStarted){
                    $(".ModalClose")[0].click();
                }
                break;
            case POSTGAMEENDED:
                $(".botstate").text("Post Game Ended");
                if(botStarted){
                    $(".ModalClose")[0].click();
                }
                break;
            case HOMEPAGE:
                $(".botstate").text("Homepage");
                if(botStarted){
                    $(".PlayButton--big span").click();
                }
                break;
            case GAMEINIT:
                $(".botstate").text("Game loading");
                break;

        }

        $(".qCount").text(localStorage.length-1);
    };

    var randomAnswer = function(){
        var len = $(".Answer__text").length;
        var random = Math.floor( Math.random() * len ) + 1;
        $(".Answer__text").eq(random).click();
    };

    var answerFromLocal = function(){
        var answerText = localStorage.getItem($(".Question__text").text());
        $(".Answer__text").each(function(i,elem){
            if($(elem).text() == answerText){
                $(elem).click();
            }
        });
    };

})();