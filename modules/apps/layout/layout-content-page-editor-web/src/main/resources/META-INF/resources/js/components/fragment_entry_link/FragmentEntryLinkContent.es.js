import {closest} from 'metal-dom';
import Component from 'metal-component';
import {Config} from 'metal-state';
import {isFunction, isObject} from 'metal';
import Soy from 'metal-soy';

import {
	BACKGROUND_IMAGE_FRAGMENT_ENTRY_PROCESSOR,
	EDITABLE_FRAGMENT_ENTRY_PROCESSOR
} from '../../utils/constants';
import FragmentEditableField from './FragmentEditableField.es';
import {setIn} from '../../utils/FragmentsEditorUpdateUtils.es';
import {shouldUpdateOnChangeProperties} from '../../utils/FragmentsEditorComponentUtils.es';
import templates from './FragmentEntryLinkContent.soy';
import {getConnectedComponent} from '../../store/ConnectedComponent.es';
import FragmentEditableBackgroundImage from './FragmentEditableBackgroundImage.es';

/**
 * Creates a Fragment Entry Link Content component.
 * @review
 */
class FragmentEntryLinkContent extends Component {
	/**
	 * @inheritDoc
	 */
	disposed() {
		this._destroyEditables();
	}

	/**
	 * @inheritDoc
	 */
	prepareStateForRender(state) {
		let nextState = state;

		if (state.languageId && Liferay.Language.direction) {
			nextState = setIn(
				nextState,
				['_languageDirection'],
				Liferay.Language.direction[state.languageId] || 'ltr'
			);
		}

		nextState = setIn(
			nextState,
			['content'],
			this.content ? Soy.toIncDom(this.content) : null
		);

		return nextState;
	}

	/**
	 * @inheritDoc
	 */
	rendered() {
		if (this.content) {
			this._renderContent(this.content);
		}
	}

	/**
	 * @inheritdoc
	 * @return {boolean}
	 * @review
	 */
	shouldUpdate(changes) {
		return shouldUpdateOnChangeProperties(changes, [
			'content',
			'languageId',
			'segmentsExperienceId',
			'selectedMappingTypes',
			'showMapping'
		]);
	}

	/**
	 * Renders the content if it is changed.
	 * @inheritDoc
	 * @param {string} newContent The new content to render.
	 */
	syncContent(newContent) {
		if (newContent && newContent !== this.content) {
			this._renderContent(newContent);
		}
	}

	/**
	 * Handles changes to editable values.
	 * @inheritDoc
	 * @param {object} newEditableValues The updated values.
	 * @param {object} oldEditableValues The original values.
	 */
	syncEditableValues(newEditableValues, oldEditableValues) {
		if (newEditableValues !== oldEditableValues) {
			if (this._editables) {
				this._editables.forEach(editable => {
					const editableValues =
						newEditableValues[editable.processor] &&
						newEditableValues[editable.processor][
							editable.editableId
						]
							? newEditableValues[editable.processor][
									editable.editableId
							  ]
							: {
									defaultValue: editable.content
							  };

					editable.editableValues = editableValues;
				});
			}

			this._update({
				defaultLanguageId: this.defaultLanguageId,
				defaultSegmentsExperienceId: this.defaultSegmentsExperienceId,
				languageId: this.languageId,
				segmentsExperienceId: this.segmentsExperienceId,
				updateFunctions: []
			});
		}
	}

	/**
	 * Propagates the store to editable fields when it's loaded.
	 */
	syncStore() {
		if (this._editables) {
			this._editables.forEach(editable => {
				editable.store = this.store;
			});
		}
	}

	/**
	 * Creates instances of a fragment editable field for each editable.
	 */
	_createEditables() {
		this._destroyEditables();

		const backgroundImageEditables = Array.from(
			this.refs.content.querySelectorAll('[data-lfr-background-image-id]')
		).map(element => {
			const editableId = element.dataset.lfrBackgroundImageId;
			const editableValues =
				this.editableValues[
					BACKGROUND_IMAGE_FRAGMENT_ENTRY_PROCESSOR
				] &&
				this.editableValues[BACKGROUND_IMAGE_FRAGMENT_ENTRY_PROCESSOR][
					editableId
				]
					? this.editableValues[
							BACKGROUND_IMAGE_FRAGMENT_ENTRY_PROCESSOR
					  ][editableId]
					: {
							defaultValue: ''
					  };

			return new FragmentEditableBackgroundImage({
				editableId,
				editableValues,
				element: element,
				fragmentEntryLinkId: this.fragmentEntryLinkId,
				processor: BACKGROUND_IMAGE_FRAGMENT_ENTRY_PROCESSOR,
				showMapping: this.showMapping,
				store: this.store
			});
		});

		const editableFields = Array.from(
			this.refs.content.querySelectorAll('lfr-editable')
		).map(editable => {
			const editableValues =
				this.editableValues[EDITABLE_FRAGMENT_ENTRY_PROCESSOR] &&
				this.editableValues[EDITABLE_FRAGMENT_ENTRY_PROCESSOR][
					editable.id
				]
					? this.editableValues[EDITABLE_FRAGMENT_ENTRY_PROCESSOR][
							editable.id
					  ]
					: {
							defaultValue: editable.innerHTML
					  };

			const defaultEditorConfiguration =
				this.defaultEditorConfigurations[
					editable.getAttribute('type')
				] || this.defaultEditorConfigurations.text;

			return new FragmentEditableField({
				content: editable.innerHTML,
				editableId: editable.id,
				editableValues,
				element: editable,
				fragmentEntryLinkId: this.fragmentEntryLinkId,
				processor: EDITABLE_FRAGMENT_ENTRY_PROCESSOR,

				processorsOptions: {
					defaultEditorConfiguration,
					imageSelectorURL: this.imageSelectorURL
				},

				segmentsExperienceId: this.segmentsExperienceId,
				showMapping: this.showMapping,
				store: this.store,
				type: editable.getAttribute('type')
			});
		});

		this._editables = [...backgroundImageEditables, ...editableFields];
	}

	/**
	 * Destroys existing fragment editable field instances.
	 */
	_destroyEditables() {
		if (this._editables) {
			this._editables.forEach(editable => editable.dispose());

			this._editables = [];
		}
	}

	/**
	 * @param {MouseEvent} event
	 * @private
	 * @review
	 */
	_handleFragmentEntryLinkContentClick(event) {
		const element = event.srcElement;

		if (
			closest(element, '[href]') &&
			!('lfrPageEditorHrefEnabled' in element.dataset)
		) {
			event.preventDefault();
		}
	}

	/**
	 * Parses and renders the fragment entry link content with AUI.
	 * @param {string} content
	 * @private
	 */
	_renderContent(content) {
		if (content && this.refs.content) {
			AUI().use('aui-parse-content', A => {
				const contentNode = A.one(this.refs.content);
				contentNode.plug(A.Plugin.ParseContent);
				contentNode.setContent(content);

				this._createEditables();

				this._update({
					defaultLanguageId: this.defaultLanguageId,
					defaultSegmentsExperienceId: this
						.defaultSegmentsExperienceId,
					languageId: this.languageId,
					segmentsExperienceId: this.segmentsExperienceId,
					updateFunctions: []
				});
			});
		}
	}

	/**
	 * Runs a set of update functions through the editable values inside this
	 * fragment entry link.
	 * @param {string} languageId The current language ID.
	 * @param {string} defaultLanguageId The default language ID.
	 * @param {Array<Function>} updateFunctions The set of update functions to
	 * execute for each editable value.
	 * @private
	 */
	_update({
		defaultLanguageId,
		defaultSegmentsExperienceId,
		languageId,
		segmentsExperienceId,
		updateFunctions
	}) {
		const editableValues = this.editableValues[
			EDITABLE_FRAGMENT_ENTRY_PROCESSOR
		];

		Object.keys(editableValues).forEach(editableId => {
			const editableValue = editableValues[editableId];
			const segmentedEditableValue =
				(segmentsExperienceId && editableValue[segmentsExperienceId]) ||
				editableValue[defaultSegmentsExperienceId];

			const defaultSegmentedEditableValue =
				editableValue[defaultSegmentsExperienceId];

			const defaultValue =
				(segmentedEditableValue &&
					segmentedEditableValue[defaultLanguageId]) ||
				(segmentedEditableValue &&
					segmentedEditableValue.defaultValue) ||
				(defaultSegmentedEditableValue &&
					defaultSegmentedEditableValue[defaultLanguageId]) ||
				editableValue.defaultValue;
			const mappedField = editableValue.mappedField || '';
			const value =
				segmentedEditableValue && segmentedEditableValue[languageId];

			updateFunctions.forEach(updateFunction =>
				updateFunction(editableId, value, defaultValue, mappedField)
			);
		});
	}
}

/**
 * State definition.
 * @static
 * @type {!Object}
 */
FragmentEntryLinkContent.STATE = {
	/**
	 * Fragment content to be rendered.
	 * @default ''
	 * @instance
	 * @memberOf FragmentEntryLink
	 * @type {string}
	 */
	content: Config.any()
		.setter(content => {
			return !isFunction(content) && isObject(content)
				? content.value.content
				: content;
		})
		.value(''),

	/**
	 * Editable values that should be used instead of the default ones inside
	 * editable fields.
	 * @default undefined
	 * @instance
	 * @memberOf FragmentEntryLink
	 * @type {!Object}
	 */
	editableValues: Config.object().required(),

	/**
	 * Fragment entry link ID.
	 * @default undefined
	 * @instance
	 * @memberOf FragmentEntryLinkContent
	 * @type {!string}
	 */
	fragmentEntryLinkId: Config.string().required(),

	/**
	 * If <code>true</code>, the asset mapping is enabled.
	 * @default false
	 * @instance
	 * @memberOf FragmentEntryLink
	 * @type {boolean}
	 */
	showMapping: Config.bool().value(false)
};

const ConnectedFragmentEntryLinkContent = getConnectedComponent(
	FragmentEntryLinkContent,
	[
		'defaultEditorConfigurations',
		'defaultLanguageId',
		'defaultSegmentsExperienceId',
		'imageSelectorURL',
		'languageId',
		'portletNamespace',
		'selectedMappingTypes',
		'segmentsExperienceId',
		'spritemap'
	]
);

Soy.register(ConnectedFragmentEntryLinkContent, templates);

export {ConnectedFragmentEntryLinkContent, FragmentEntryLinkContent};
export default ConnectedFragmentEntryLinkContent;
