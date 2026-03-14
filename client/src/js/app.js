import Controller from './Controller';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container');
  const controller = new Controller(container);
  controller.init();
});
