document.addEventListener('DOMContentLoaded', () => {
    const showButton = document.getElementById('show-budget-btn');
    const budgetContainer = document.getElementById('budget-container');
    const budgetInput = document.getElementById('budget');
    const nextButtonBudget = document.getElementById('show-type-btn');
    const typeContainer = document.getElementById('type-container');
    const typeSelect = document.getElementById('type');
    const nextButtonType = document.getElementById('show-results-btn');

    showButton.addEventListener('click', () => {
        showButton.style.display = 'none';
        budgetContainer.classList.remove('hidden');
        budgetInput.focus();
    });

    budgetInput.addEventListener('input', () => {
        nextButtonBudget.disabled = (budgetInput.value.trim() === '');
    });

    nextButtonBudget.addEventListener('click', () => {
        budgetContainer.classList.add('hidden');
        typeContainer.classList.remove('hidden');
        typeSelect.focus();
    });

    typeSelect.addEventListener('change', () => {
        nextButtonType.disabled = (typeSelect.value === '');
    });

    nextButtonType.addEventListener('click', () => {
        const budgetValue = budgetInput.value;
        const typeValue = typeSelect.value;
        
        const queryParams = new URLSearchParams();
        queryParams.append('budget', budgetValue);
        queryParams.append('use', typeValue);

        window.location.href = `results/results.html?${queryParams.toString()}`;
    });
});