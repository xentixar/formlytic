(function () {
    document.querySelectorAll('select[searchable="true"]').forEach(function (selectElement) {
        selectElement.style.display = 'none';

        const wrapper = document.createElement('div');
        wrapper.className = 'xen-select-wrapper';

        const searchInput = document.createElement('input');
        searchInput.className = 'xen-search';
        searchInput.placeholder = selectElement.options[0]?.text || 'Search...';

        const searchContainer = document.createElement('div');
        searchContainer.className = 'xen-search-container';

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'xen-options';

        let selectedTagsContainer;
        if (selectElement.multiple) {
            selectedTagsContainer = document.createElement('div');
            selectedTagsContainer.className = 'xen-selected-tags';
            selectedTagsContainer.style.display = 'none';
            wrapper.appendChild(selectedTagsContainer);
        }

        const selectedValues = new Set();
        if (selectElement.multiple) {
            Array.from(selectElement.selectedOptions).forEach(option => {
                selectedValues.add(option.value);
                addSelectedTag(option.value, option.textContent);
            });
            
            if (selectedValues.size > 0) {
                selectedTagsContainer.style.display = 'flex';
            }
        }

        function addSelectedTag(value, text) {
            if (!selectElement.multiple) return;
            const tag = document.createElement('span');
            tag.className = 'xen-selected-tag';
            tag.innerHTML = `${text} <span class="xen-remove-tag" data-value="${value}">&times;</span>`;
            selectedTagsContainer.appendChild(tag);
            
            selectedTagsContainer.style.display = 'flex';
            
            const option = Array.from(selectElement.options).find(opt => opt.value === value);
            if (option) {
                option.selected = true;
            }
        }

        function removeSelectedTag(value) {
            if (!selectElement.multiple) return;
            const tag = selectedTagsContainer.querySelector(`[data-value="${value}"]`).parentElement;
            tag.remove();
            selectedValues.delete(value);
            
            if (selectedValues.size === 0) {
                selectedTagsContainer.style.display = 'none';
            }
            
            const option = Array.from(selectElement.options).find(opt => opt.value === value);
            if (option) {
                option.selected = false;
            }
        }

        const form = selectElement.closest('form');
        if (form) {
            form.addEventListener('submit', function() {
                if (selectElement.multiple) {
                    Array.from(selectElement.options).forEach(option => {
                        option.selected = selectedValues.has(option.value);
                    });
                }
            });
        }

        Array.from(selectElement.options).slice(1).forEach(function (option) {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'xen-option';
            optionDiv.textContent = option.textContent;
            optionDiv.dataset.value = option.value;
            if (selectedValues.has(option.value)) {
                optionDiv.classList.add('selected');
            }
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

                if (selectElement.multiple) {
                    if (selectedValues.has(selectedValue)) {
                        selectedValues.delete(selectedValue);
                        event.target.classList.remove('selected');
                        removeSelectedTag(selectedValue);
                    } else {
                        selectedValues.add(selectedValue);
                        event.target.classList.add('selected');
                        addSelectedTag(selectedValue, selectedText);
                    }
                    searchInput.value = '';
                } else {
                    selectElement.value = selectedValue;
                    searchInput.value = selectedText;
                    optionsDiv.style.display = 'none';
                }
            }
        });

        if (selectElement.multiple) {
            selectedTagsContainer.addEventListener('click', function (event) {
                if (event.target.classList.contains('xen-remove-tag')) {
                    const value = event.target.dataset.value;
                    removeSelectedTag(value);
                    const option = optionsDiv.querySelector(`[data-value="${value}"]`);
                    if (option) {
                        option.classList.remove('selected');
                    }
                }
            });
        }

        searchInput.addEventListener('focus', function () {
            optionsDiv.style.display = 'block';
        });

        document.addEventListener('click', function (event) {
            if (!wrapper.contains(event.target)) {
                optionsDiv.style.display = 'none';
            }
        });

        let activeIndex = -1;

        searchInput.addEventListener('keydown', function (event) {
            const visibleOptions = Array.from(optionsDiv.querySelectorAll('.xen-option:not([style*="display: none"])'));
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                activeIndex = (activeIndex + 1) % visibleOptions.length;
                visibleOptions.forEach((option, index) => {
                    option.classList.toggle('active', index === activeIndex);
                });
                if (activeIndex >= 0) {
                    visibleOptions[activeIndex].scrollIntoView({ block: 'nearest' });
                }
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                activeIndex = (activeIndex - 1 + visibleOptions.length) % visibleOptions.length;
                visibleOptions.forEach((option, index) => {
                    option.classList.toggle('active', index === activeIndex);
                });
                if (activeIndex >= 0) {
                    visibleOptions[activeIndex].scrollIntoView({ block: 'nearest' });
                }
            } else if (event.key === 'Enter') {
                event.preventDefault();
                if (activeIndex >= 0 && visibleOptions[activeIndex]) {
                    const selectedValue = visibleOptions[activeIndex].dataset.value;
                    const selectedText = visibleOptions[activeIndex].textContent;

                    if (selectElement.multiple) {
                        if (selectedValues.has(selectedValue)) {
                            selectedValues.delete(selectedValue);
                            visibleOptions[activeIndex].classList.remove('selected');
                            removeSelectedTag(selectedValue);
                        } else {
                            selectedValues.add(selectedValue);
                            visibleOptions[activeIndex].classList.add('selected');
                            addSelectedTag(selectedValue, selectedText);
                        }
                        searchInput.value = '';
                    } else {
                        selectElement.value = selectedValue;
                        searchInput.value = selectedText;
                        optionsDiv.style.display = 'none';
                        searchInput.blur();
                    }
                }
            }
        });

        searchContainer.appendChild(searchInput);
        
        if (selectElement.getAttribute('suffixIcon')) {
            const suffixIcon = document.createElement('i');
            suffixIcon.className += selectElement.getAttribute('suffixIcon');
            suffixIcon.className += ' xen-select-suffix-icon';
            searchContainer.appendChild(suffixIcon);
        }
        
        wrapper.appendChild(searchContainer);
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

        element.closest('form')?.addEventListener('submit', function () {
            if (!element.value.endsWith(suffix)) {
                element.value = element.value + suffix;
            }
        });
    });
})();
