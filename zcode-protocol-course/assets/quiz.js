/* ============================================================
   Quiz 组件：课程共享的检索练习组件
   用法：<div class="quiz" data-title="...">
           <span class="quiz-score"></span>
           <div class="quiz-q" data-answer="2">  <!-- 正确答案下标(0起) -->
             <p class="q-text">题干？</p>
             <button class="quiz-opt">选项A</button>
             <button class="quiz-opt">选项B</button>
             <button class="quiz-opt">选项C</button>
             <button class="quiz-opt">选项D</button>
             <p class="quiz-feedback"></p>
           </div>
           ...
         </div>
  选错时自动高亮正确答案，提示词留空由脚本生成。
  注意：选项文字尽量等长，不给用户猜测线索。
  依赖：assets/lesson.css 中的 .quiz 系列样式。
  纯原生 JS，无依赖，可离线使用。
   ============================================================ */
(function () {
  'use strict';

  document.querySelectorAll('.quiz').forEach(function (quiz) {
    var questions = quiz.querySelectorAll('.quiz-q');
    var total = questions.length;
    var correct = 0;
    var scoreEl = quiz.querySelector('.quiz-score');
    var title = quiz.getAttribute('data-title') || '检索练习';

    if (scoreEl) {
      scoreEl.textContent = title + '：0 / ' + total;
    }

    questions.forEach(function (q) {
      var answerIdx = parseInt(q.getAttribute('data-answer'), 10);
      var buttons = q.querySelectorAll('.quiz-opt');
      var feedback = q.querySelector('.quiz-feedback');

      buttons.forEach(function (btn, i) {
        btn.addEventListener('click', function () {
          if (q.classList.contains('answered')) { return; }
          q.classList.add('answered');

          var isCorrect = (i === answerIdx);
          if (isCorrect) {
            correct++;
            btn.classList.add('correct');
            if (feedback) { feedback.textContent = '✓ 正确'; feedback.className = 'quiz-feedback ok'; }
          } else {
            btn.classList.add('wrong');
            buttons[answerIdx].classList.add('correct');
            if (feedback) { feedback.textContent = '✗ 不对，正确答案已标绿'; feedback.className = 'quiz-feedback no'; }
          }
          if (scoreEl) { scoreEl.textContent = title + '：' + correct + ' / ' + total; }
        });
      });
    });

    // 重置按钮
    var reset = document.createElement('button');
    reset.className = 'quiz-opt';
    reset.style.width = 'auto';
    reset.style.marginTop = '1rem';
    reset.style.padding = '.3rem .8rem';
    reset.textContent = '↻ 重做本题组';
    reset.addEventListener('click', function () {
      questions.forEach(function (q) {
        q.classList.remove('answered');
        q.querySelectorAll('.quiz-opt').forEach(function (b) {
          b.classList.remove('correct', 'wrong');
        });
        var fb = q.querySelector('.quiz-feedback');
        if (fb) { fb.textContent = ''; fb.className = 'quiz-feedback'; }
      });
      correct = 0;
      if (scoreEl) { scoreEl.textContent = title + '：0 / ' + total; }
    });
    quiz.appendChild(reset);
  });
})();
