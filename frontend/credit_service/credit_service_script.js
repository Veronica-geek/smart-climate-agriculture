document.addEventListener('DOMContentLoaded', () => {
    const termsPopup = document.getElementById('termsPopup');
    const applicationPopup = document.getElementById('applicationPopup');
    const forms = applicationPopup.querySelectorAll('.credit-form');
    let applicationId = null;

    // Open Terms Popup
    window.openTermsPopup = () => {
        termsPopup.showModal();
    };

    // Proceed After Terms Agreement
    window.proceedAfterTerms = () => {
        const agreeCheckbox = document.getElementById('agreeTerms');
        if (agreeCheckbox.checked) {
            termsPopup.close();
            openApplicationPopup();
        } else {
            alert('You must agree to the Terms and Privacy Policy to proceed.');
        }
    };

    // Open and close application popup
    window.openApplicationPopup = () => {
        const phoneNumber = new URLSearchParams(window.location.search).get('phoneNumber');
        if (!phoneNumber) {
            alert('Please log in to apply for credit.');
            return;
        }
        applicationPopup.showModal();
    };

    window.closeApplicationPopup = () => {
        applicationPopup.close();
        resetApplication();
    };

    // Form submission logic
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const url = new URL(form.action, window.location.origin);
            const phoneNumber = new URLSearchParams(window.location.search).get('phoneNumber');
            url.searchParams.append('phoneNumber', phoneNumber);

            if (!applicationId && form.id === 'creditForm') {
                formData.append('phone', phoneNumber);
            }
            formData.append('applicationId', applicationId || '');

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    body: form.id === 'attachmentForm' ? formData : new URLSearchParams(Object.fromEntries(formData))
                });
                const data = await response.json();

                if (response.ok) {
                    if (!applicationId) applicationId = data.applicationId;
                    const applicationIdFields = form.querySelectorAll('[id$="ApplicationId"]');
                    applicationIdFields.forEach(field => field.value = applicationId);

                    const currentStep = form.closest('.step');
                    const nextStep = currentStep.nextElementSibling;
                    if (nextStep && nextStep.classList.contains('step')) {
                        currentStep.style.display = 'none';
                        nextStep.style.display = 'block';
                    } else if (form.id === 'consentForm') {
                        alert('Application submitted successfully!');
                        closeApplicationPopup();
                    }
                } else {
                    alert(data.error || 'Submission failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    });

    // FAQ Collapsible Functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
        });
    });

    // Cooperative Dropdown Toggle
    const farmingType = document.getElementById('farmingType');
    const cooperativeGroup = document.getElementById('cooperativeGroup');
    if (farmingType && cooperativeGroup) {
        farmingType.addEventListener('change', () => {
            cooperativeGroup.style.display = farmingType.value === 'cooperative' ? 'block' : 'none';
        });
    }
});

function resetApplication() {
    const steps = document.querySelectorAll('#applicationPopup .step');
    steps.forEach(step => step.style.display = step.id === 'personal-info' ? 'block' : 'none');
    document.getElementById('applicationId').value = '';
    const forms = document.querySelectorAll('.credit-form');
    forms.forEach(form => form.reset());
}