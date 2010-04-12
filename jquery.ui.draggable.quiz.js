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
          questions = $(o.questions, self),
          choices = $(o.choice, self);
      
      // Make questions droppable.
      $(choices).droppable({
        accept: o.questions +' '+ o.question +', '+ o.choice +' '+ o.question,
        hoverClass: o.questionsHoverClass,
        drop: function(e, ui) {
          makeChoice(ui.draggable, $(e.target), ui.draggable.parents(o.choice), e, o);
        }
      });
      
      // Make choices droppable.
      $(questions).droppable({
        accept: o.choice +' '+ o.question,
        hoverClass: o.choicesHoverClass,
        drop: function(e, ui) {
          unmakeChoice(ui.draggable, o);
        }
      });
      
      // Make questions draggable.
      $(o.question, o.questions).draggable(o.draggable);
      
      o.after.call(this);
    });
  };
  
  $.fn.draggableQuiz.defaults = {
    speedIn: 500,
    speedOut: 500,
    question: '.question',
    questions: '.questions',
    questionsHoverClass: 'ui-state-hover',
    choice: '.choice',
    choices: '.choices',
    choicesHoverClass: 'ui-state-hover',
    after: null,
    passed: null,
    questionIn: function(speed, callback) {
      $(this).animate({ opacity: 1 }, speed, callback);
    },
    questionOut: function(speed, callback) {
      $(this).animate({ opacity: 0.5 }, speed, callback);
    },
    choiceIn: function(speed, callback) {
      $(this).hide().height(25).fadeIn(speed, callback);
    },
    choiceOut: function(speed, callback) {
      $(this).fadeOut(speed, callback);
    }
  };
  
  $.fn.draggableQuiz.defaults.draggable = {
    cursor: 'move',
    helper: 'clone',
    revert: 'invalid',
    zIndex: 10000,
    start: function(e, ui) {
      room = $(e.target).parents($.fn.draggableQuiz.defaults.choice);
      ui.helper.animate({ opacity: 0.5 }, 1000);
    }
  };
  
  function makeChoice(question, toChoice, fromChoice, e, o) {
    // Check if user moved to same choice.
    if ( toChoice.attr('id') == fromChoice.attr('id') )
      return false;
    
    // Add question to choice.
    o.choiceIn.call(question.clone().draggable(o.draggable).appendTo(toChoice), o.speedIn, function(){
      o.choiceOut.call($(o.question +"[data='"+ question.attr('data') +"']", fromChoice), o.speedOut, function(){
        $(this).remove();
      });
      
      // Disable question.
      o.questionOut.call($(o.questions +' '+ o.question +"[data='"+ question.attr('data') +"']", o.self).draggable('disable'), o.speedOut);
      
      checkChoices(o);
    });
  }
  
  function unmakeChoice(question, o) {
    o.choiceOut.call(question, o.speedOut, function(){
      o.questionIn.call($(o.question +"[data='"+ question.attr('data') + "']", o.questions).draggable('enable'), o.speedIn, function(){
        question.remove();
        
        checkChoices(o);
      });
    });
  }
  
  function checkChoices(o) {
    for ( var a in o.answers )
      for ( var i in o.answers[a] )
        if ( $(o.answers[a][i], a).length == 0 )
          return false;
    
    o.passed.call(this);
  }
  
  function log(s) {
    if ( window.console && window.console.log )
      window.console.log(s);
  }
  
  function debug(s) {
    if ( $.fn.draggableQuiz.debug )
      log(s);
  }
  
})(jQuery);