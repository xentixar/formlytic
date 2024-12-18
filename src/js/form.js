(function () {
    document.querySelectorAll('select[searchable="true"]').forEach(function (selectElement) {
        selectElement.style.display = 'none';

        const wrapper = document.createElement('div');
        wrapper.className = 'xen-select-wrapper';

        const searchInput = document.createElement('input');
        searchInput.className = 'xen-search';
        searchInput.placeholder = selectElement.options[0]?.text || 'Search...';

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'xen-options';

        Array.from(selectElement.options).slice(1).forEach(function (option) {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'xen-option';
            optionDiv.textContent = option.textContent;
            optionDiv.dataset.value = option.value;
            optionsDiv.appendChild(optionDiv);
        });

        searchInput.addEventListener('input', function () {
            const query = searchInput.value.toLowerCase();
            optionsDiv.querySelectorAll('.xen-option').forEach(function (option) {
                if (option.textContent.toLowerCase().includes(query)) {
                    option.style.display = 'block';
                } else {
                    option.style.display = 'none';
                }
            });
        });

        optionsDiv.addEventListener('click', function (event) {
            if (event.target.classList.contains('xen-option')) {
                const selectedValue = event.target.dataset.value;
                const selectedText = event.target.textContent;

                selectElement.value = selectedValue;
                searchInput.value = selectedText;
                optionsDiv.style.display = 'none';
            }
        });

        searchInput.addEventListener('focus', function () {
            optionsDiv.style.display = 'block';
        });

        document.addEventListener('click', function (event) {
            if (!wrapper.contains(event.target)) {
                optionsDiv.style.display = 'none';
            }
        });

        searchInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                const firstVisibleOption = optionsDiv.querySelector('.xen-option:not([style*="display: none"])');
                if (firstVisibleOption) {
                    const selectedValue = firstVisibleOption.dataset.value;
                    const selectedText = firstVisibleOption.textContent;

                    selectElement.value = selectedValue;
                    searchInput.value = selectedText;
                    optionsDiv.style.display = 'none';
                    searchInput.blur();
                }
            }
        });

        wrapper.appendChild(searchInput);
        wrapper.appendChild(optionsDiv);
        selectElement.parentNode.insertBefore(wrapper, selectElement);
    });

    document.querySelectorAll('input[prefix]').forEach(function (element) {
        const wrapper = document.createElement('div');
        wrapper.className = 'xen-input-wrapper';

        const prefixSpan = document.createElement('span');
        prefixSpan.className = 'xen-input-prefix';
        const prefixContent = element.getAttribute('prefix');
        prefixSpan.innerHTML = prefixContent;

        const prefix = prefixSpan.textContent;

        element.parentNode.insertBefore(wrapper, element);

        wrapper.appendChild(prefixSpan);
        wrapper.appendChild(element);

        element.closest('form')?.addEventListener('submit', function () {
            if (!element.value.startsWith(prefix)) {
                element.value = prefix + element.value;
            }
        });
    });

    document.querySelectorAll('input[suffix]').forEach(function (element) {
        const wrapper = document.createElement('div');
        wrapper.className = 'xen-input-wrapper';

        const suffixSpan = document.createElement('span');
        suffixSpan.className = 'xen-input-suffix';
        const suffixContent = element.getAttribute('suffix');
        suffixSpan.innerHTML = suffixContent;

        const suffix = suffixSpan.textContent;

        element.parentNode.append(wrapper, element);

        wrapper.appendChild(element);
        wrapper.appendChild(suffixSpan);

        element.style.paddingRight = `${suffixSpan.offsetWidth + 10}px`;

        element.closest('form')?.addEventListener('submit', function () {
            if (!element.value.endsWith(suffix)) {
                element.value = element.value + suffix;
            }
        });
    });


})();
