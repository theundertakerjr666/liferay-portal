AUI.add(
	'liferay-ddm-form-field-text',
	function(A) {
		var ENTER_KEY = 13;

		var Renderer = Liferay.DDM.Renderer;

		var Util = Renderer.Util;

		new A.TooltipDelegate({
			cssClass: 'clay-tooltip',
			opacity: 1,
			position: 'right',
			trigger: '.liferay-ddm-form-field-text .trigger-tooltip',
			triggerHideEvent: ['blur', 'mouseleave'],
			triggerShowEvent: ['focus', 'mouseover'],
			visible: false
		});

		var TextField = A.Component.create({
			ATTRS: {
				autocompleteEnabled: {
					state: true,
					value: false
				},

				displayStyle: {
					state: true,
					value: 'singleline'
				},

				initialHeight: {
					value: 0
				},

				options: {
					value: []
				},

				placeholder: {
					state: true,
					value: ''
				},

				type: {
					value: 'text'
				}
			},

			EXTENDS: Liferay.DDM.Renderer.Field,

			NAME: 'liferay-ddm-form-field-text',

			prototype: {
				initializer: function() {
					var instance = this;

					instance._eventHandlers.push(
						instance.after(
							'optionsChange',
							instance._afterOptionsChange
						),
						instance.after(
							'valueChange',
							instance._onTextFieldValueChange
						),
						instance.bindInputEvent(
							'focus',
							A.bind('_onTextFieldFocus', instance)
						),
						instance.bindInputEvent(
							'keydown',
							A.bind('_handleEnterKeyDown', instance)
						)
					);

					instance.evaluate = A.debounce(function() {
						TextField.superclass.evaluate.apply(
							instance,
							arguments
						);
					}, 300);
				},

				destructor: function() {
					var instance = this;

					if (instance._autoComplete) {
						instance._autoComplete.destroy();
					}

					instance._autoComplete = null;
					instance.evaluate = null;
				},

				getAutoComplete: function() {
					var instance = this;

					var autoComplete = instance._autoComplete;

					var inputNode = instance.getInputNode();

					if (autoComplete) {
						autoComplete.set('inputNode', inputNode);
					} else {
						instance._createAutocomplete();
						autoComplete = instance._autoComplete;
					}

					return autoComplete;
				},

				getChangeEventName: function() {
					return 'input';
				},

				render: function() {
					var instance = this;

					TextField.superclass.render.apply(instance, arguments);

					var autocompleteEnabled = instance.get(
						'autocompleteEnabled'
					);

					if (autocompleteEnabled && instance.get('visible')) {
						instance._createAutocomplete();
					}

					if (instance.get('displayStyle') === 'multiline') {
						instance._setInitialHeight();
						instance.syncInputHeight();
					}

					return instance;
				},

				showErrorMessage: function() {
					var instance = this;

					TextField.superclass.showErrorMessage.apply(
						instance,
						arguments
					);

					var container = instance.get('container');

					var formGroup = container.one('.form-group');

					formGroup.append(container.one('.form-feedback-item'));
				},

				syncInputHeight: function() {
					var instance = this;

					var inputNode = instance.getInputNode();

					var initialHeight = instance.get('initialHeight');

					inputNode.setStyle('height', initialHeight);

					var height = inputNode.get('scrollHeight');

					if (height > initialHeight) {
						inputNode.setStyle('height', height);
					}
				},

				_afterAutoCompleteSelect: function() {
					var instance = this;

					instance.set('value', instance.getValue());

					instance.evaluate();
				},

				_afterOptionsChange: function(event) {
					var instance = this;

					if (instance.get('autocompleteEnabled')) {
						var autoComplete = instance.getAutoComplete();

						if (!Util.compare(event.newVal, event.prevVal)) {
							autoComplete.set('source', event.newVal);

							autoComplete.fire('query', {
								inputValue: instance.getValue(),
								query: instance.getValue(),
								src: A.AutoCompleteBase.UI_SRC
							});
						}
					}
				},

				_createAutocomplete: function() {
					var instance = this;

					var inputNode = instance.getInputNode();

					if (instance._autoComplete) {
						instance._autoComplete.destroy();
					}

					instance._autoComplete = new A.AutoComplete({
						after: {
							select: A.bind(
								instance._afterAutoCompleteSelect,
								instance
							)
						},
						inputNode: inputNode,
						maxResults: 10,
						render: true,
						resultFilters: ['charMatch', 'subWordMatch'],
						resultHighlighter: 'subWordMatch',
						resultTextLocator: 'label',
						source: instance.get('options')
					});
				},

				_handleEnterKeyDown: function(event) {
					var instance = this;

					var displayStyle = instance.get('displayStyle');

					if (
						displayStyle === 'singleline' &&
						event.keyCode === ENTER_KEY &&
						event.which === ENTER_KEY
					) {
						event.preventDefault();
					}
				},

				_onTextFieldFocus: function() {
					var instance = this;

					var inputNode = instance.getInputNode();

					if (
						inputNode.getData('predefined-value') ==
							inputNode.val() &&
						inputNode.getData('interaction')
					) {
						inputNode.setData('interaction', false);
						instance.set('value', '');
						instance.setValue('');
					}
				},

				_onTextFieldValueChange: function() {
					var instance = this;

					if (instance.get('displayStyle') === 'multiline') {
						instance.syncInputHeight();
					}
				},

				_setInitialHeight: function() {
					var instance = this;

					var inputNode = instance.getInputNode();

					var initialHeightInPx = inputNode.getStyle('height');

					var initialHeight = parseInt(initialHeightInPx, 10);

					instance.set('initialHeight', initialHeight);
				}
			}
		});

		Liferay.namespace('DDM.Field').Text = TextField;
	},
	'',
	{
		requires: [
			'aui-autosize-deprecated',
			'aui-tooltip',
			'autocomplete',
			'autocomplete-filters',
			'autocomplete-highlighters',
			'autocomplete-highlighters-accentfold',
			'liferay-ddm-form-renderer-field'
		]
	}
);
