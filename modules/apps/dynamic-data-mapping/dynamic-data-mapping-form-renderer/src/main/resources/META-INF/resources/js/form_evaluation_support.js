AUI.add(
	'liferay-ddm-form-renderer-evaluation',
	function(A) {
		var Lang = A.Lang;

		var Renderer = Liferay.DDM.Renderer;

		var Util = Renderer.Util;

		var FormEvaluationSupport = function() {};

		FormEvaluationSupport.ATTRS = {
			evaluatorURL: {
				value: ''
			},

			evaluator: {
				valueFn: '_valueEvaluator'
			},

			readOnly: {
				value: false
			}
		};

		FormEvaluationSupport.prototype = {
			initializer: function() {
				var instance = this;

				var evaluator = instance.get('evaluator');

				evaluator.after(
					'evaluationEnded',
					A.bind('_afterEvaluationEnded', instance)
				);
			},

			destructor: function() {
				var instance = this;

				var evaluator = instance.get('evaluator');

				evaluator.destroy();
			},

			evaluate: function(callback) {
				var instance = this;

				var evaluator = instance.get('evaluator');

				evaluator.evaluate(instance, callback);
			},

			processEvaluationResultEvent: function(event) {
				var instance = this;

				var trigger = event.trigger;

				var result = event.result;

				if (result && Lang.isObject(result)) {
					var visitor = instance.get('visitor');

					instance.set('pagesState', result);

					visitor.set('pages', result);

					visitor.set('fieldHandler', function(fieldContext) {
						var qualifiedName = fieldContext.name;

						var name = Util.getFieldNameFromQualifiedName(
							qualifiedName
						);

						var instanceId = Util.getInstanceIdFromQualifiedName(
							qualifiedName
						);

						var field = instance.getField(name, instanceId);

						if (!field) {
							return;
						}

						if (field !== trigger) {
							if (
								fieldContext.valueChanged &&
								!Util.compare(
									field.get('value'),
									fieldContext.value
								)
							) {
								field.setValue(fieldContext.value);
							}
						}

						delete fieldContext.value;

						fieldContext = field.processEvaluationContext(
							fieldContext,
							result
						);

						var currentContext = field.get('context');

						if (
							!currentContext.visited ||
							fieldContext.valid !== false
						) {
							currentContext.errorMessage = '';
							currentContext.valid = true;
						}

						fieldContext = A.merge(
							currentContext,
							fieldContext,
							field.getEvaluationContext(fieldContext)
						);

						if (fieldContext.valid) {
							fieldContext.visited = true;
						}

						field.set('context', fieldContext);
					});

					visitor.visit();
				} else {
					var strings = instance.get('strings');

					instance.showAlert(strings.requestErrorMessage);
				}
			},

			_afterEvaluationEnded: function(event) {
				var instance = this;

				var trigger = event.trigger;

				trigger.hideFeedback();

				instance.processEvaluationResultEvent(event);
			},

			_valueEvaluator: function() {
				var instance = this;

				return new Renderer.ExpressionsEvaluator({
					enabled: !instance.get('readOnly'),
					form: instance
				});
			}
		};

		Liferay.namespace(
			'DDM.Renderer'
		).FormEvaluationSupport = FormEvaluationSupport;
	},
	'',
	{
		requires: []
	}
);
