import 'frontend-js-web/liferay/compat/tooltip/Tooltip.es';
import Component from 'metal-component';
import Soy from 'metal-soy';
import {Config} from 'metal-state';

import AceEditor from './AceEditor.es';
import templates from './SourceEditor.soy';
import './SourceEditorToolbar.es';

/**
 * Creates a Source Editor component to use for source code editing.
 */
class SourceEditor extends Component {
	/**
	 * Callback that propagates the <code>contentChanged</code> event when the
	 * internal Ace Editor is modified.
	 *
	 * @param {!Event} event
	 */
	_handleContentChanged(event) {
		this.emit('contentChanged', {
			content: event.content,
			valid: event.valid
		});
	}
}

/**
 * State definition.
 *
 * @static
 * @type {!Object}
 */
SourceEditor.STATE = {
	/**
	 * List of tags for custom autocompletion in the HTML editor.
	 *
	 * @default []
	 * @instance
	 * @memberOf SourceEditor
	 * @type Array
	 */
	autocompleteTags: Config.arrayOf(
		Config.shapeOf({
			content: Config.string(),
			name: Config.string()
		})
	),

	/**
	 * Initial content sent to the editor.
	 *
	 * @default undefined
	 * @instance
	 * @memberOf SourceEditor
	 * @type {!string}
	 */
	initialContent: Config.string().required(),

	/**
	 * Path of the available icons.
	 *
	 * @default undefined
	 * @instance
	 * @memberOf SourceEditor
	 * @type {!string}
	 */
	spritemap: Config.string().required(),

	/**
	 * Syntax used for the Ace Editor that is rendered on the interface.
	 *
	 * @default undefined
	 * @instance
	 * @memberOf SourceEditor
	 * @see {@link AceEditor.SYNTAX|SYNTAX}
	 * @type {!string}
	 */
	syntax: Config.oneOf(Object.values(AceEditor.SYNTAX)).required()
};

Soy.register(SourceEditor, templates);

export {SourceEditor};
export default SourceEditor;
