document.addEventListener('DOMContentLoaded', () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const budget = urlParams.get('budget');
    const useCase = urlParams.get('use');
    
    const budgetElement = document.getElementById('budget-result');
    const useCaseElement = document.getElementById('use-case-result');
    
    if (budget) {
        budgetElement.textContent = `$${budget}`;
    } else {
        budgetElement.textContent = "Not Provided";
    }
    
    if (useCase) {
        useCaseElement.textContent = useCase;
    } else {
        useCaseElement.textContent = "Not Provided";
    }

});