const element = document.createElement('span');
export function entityRemover(input: string) {
    element.innerHTML = input;
    return element.textContent;
}
