export const isMouseLeftButtonPressed = (e: MouseEvent): boolean => {
  const buttons = e.buttons.toString(2);
  const leftButton = buttons.slice(-1);
  return (leftButton === '1');
};
