/*
 * jQuery UI Draggable Quiz Plugin by M. Pezzi
 * http://thespiral.ca/jquery/draggableQuiz/demo/
 * Version: 1.0 (03/07/10)
 * Dual licensed under the MIT and GPL licences:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Requires: jQuery v1.4.2 or later
 */

;(function($){
  
  // Ensure the required jQuery UI Plugins are available.
  if ( $.fn.draggable == undefined || $.fn.droppable == undefined )
    alert('Plugin required UI.Draggable and UI.Droppable');
  
  $.fn.draggableQuiz = function(options) {
    return this.each(function(){
      var self = $(this), o = $.extend({ self: self }, $.fn.draggableQuiz.defaults, options || {}),
          question_container = $(o.questions, self),
          choices = $(o.choice, self);
      
      // Make the questions draggable.
      $(o.question, o.questions).draggable(o.draggable).disableTextSelect().data('quiz.disabled', false);
      
      // Make the choices droppable.
      $(choices).droppable({
        accept: o.questions +' '+ o.question +', '+ o.choice +' '+ o.question,
        hoverClass: o.questionsHoverClass,
        drop: function(e, ui) {
          makeChoice(ui.draggable, $(e.target), ui.draggable.parents(o.choice), e, o);
        }
      });
      
      // Make the questions container droppable.
      $(question_container).droppable({
        accept: o.choice +' '+ o.question,
        hoverClass: o.choicesHoverClass,
        drop: function(e, ui) {
          unmakeChoice(ui.draggable, o);
        }
      });
      
      if ( o.after )
        o.after.call();
    });
  };
  
  $.fn.draggableQuiz.defaults = {
    draggable: {
      cursor: 'move',
      helper: 'clone',
      revert: 'invalid',
      zIndex: 10000,
      start: null
    },
    speedIn: 500,
    speedOut: 500,
    question: '.question',
    questions: '.questions',
    questionsHoverClass: 'ui-state-hover',
    choice: '.choice',
    choiceInner: '.choice-inner',
    choices: '.choices',
    choicesHoverClass: 'ui-state-hover',
    choiceAppendTo: null,
    after: null,
    passed: null,
    finished: null,
    questionIn: function(speed, callback) {
      $(this).animate({ opacity: 1 }, speed, callback);
    },
    questionOut: function(speed, callback) {
      $(this).css({ opacity: 1 }).animate({ opacity: 0.5 }, speed, callback);
    },
    choiceIn: function(speed, callback) {
      $(this).hide().height(40).fadeIn(speed, callback);
    },
    choiceOut: function(speed, callback) {
      $(this).fadeOut(speed, callback);
    }
  };
  
  function makeChoice($question, $toChoice, $fromChoice, e, o) {
    // Check if user moved to same choice.
    if ( $toChoice.attr('id') == $fromChoice.attr('id') )
      return false;
    
    // Add question to choice.
    $to = $question.clone().draggable(o.draggable).appendTo(o.choiceAppendTo ? $toChoice.find(o.choiceAppendTo) : $toChoice);
    o.choiceIn.call($to, o.speedIn, function(){
      checkChoices(o);
    });
    
    // Remove question from previous choice.
    $from = $(o.question +"[data='"+ $question.attr('data') +"']", $fromChoice);
    o.choiceOut.call($from, o.speedOut, function(){
      $(this).remove();
      checkChoices(o);
    });
    
    // Disable the question.
    $q = $(o.questions +' '+ o.question +"[data='"+ $question.attr('data') +"']", o.self);
    
    if ( !$q.data('quiz.disabled') ) {
      $q.draggable('disable').css('cursor', 'default').data('quiz.disabled', true);
      o.questionOut.call($q, o.speedOut);
    }
    
  }
  
  function unmakeChoice($question, o) {
    // Enable the question.
    $q = $(o.question +"[data='"+ $question.attr('data') + "']", o.questions).css('cursor', o.draggable.cursor).draggable('enable').data('quiz.disabled', false);
    
    o.questionIn.call($q, o.speedIn)
    o.choiceOut.call($question, o.speedOut, function(){
      $(this).remove();
      checkChoices(o);
    });
  }
  
  function checkChoices(o) {
    debug('[checkChoices]');
    
    if ( checkPassed(o) )
      return;
    
    if ( checkFinished(o) )
      return;
  }
  
  function checkFinished(o) {
    debug('[checkFinished]');
    
    var finished = true, wrong = 0, wrong_choices = [];
    
    // Check if test is finished.
    $(o.question, o.questions).each(function(){
      if ( !$(this).data('quiz.disabled') )
        finished = false;
    });
    
    if ( finished && o.finished ) {
      for ( var a in o.answers ) {
        for ( var i in o.answers[a] ) {
          if ( $(o.answers[a][i], a).length == 0 ) {
            wrong_choices[wrong] = o.answers[a][i];
            wrong++;
          }
        }
      }
      
      o.finished.call(this, wrong, wrong_choices);
    }
    
    return finished;
  }
  
  function checkPassed(o) {
    debug('[checkPassed]');
    
    for ( var a in o.answers )
      for ( var i in o.answers[a] )
        if ( $(o.answers[a][i], a).length == 0 )
          return false;
    
    // Test was passed.
    if ( o.passed )
      o.passed.call();
      
    return true;
  }
  
  // Debug functions.
  function log(s) {
    if ( window.console && window.console.log )
      window.console.log(s);
  }
  
  function debug(s) {
    if ( $.fn.draggableQuiz.debug )
      log(s);
  }
  
  $.extend($.fn.disableTextSelect = function() {
    return this.each(function(){
      if($.browser.mozilla){//Firefox
        $(this).css('MozUserSelect','none');
      }else if($.browser.msie){//IE
        $(this).bind('selectstart',function(){return false;});
      }else{//Opera, etc.
        $(this).mousedown(function(){return false;});
      }
    });
  });
  
})(jQuery);