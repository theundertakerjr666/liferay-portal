import core from 'metal';
import {EventHandler} from 'metal-events';
import PortletBase from 'frontend-js-web/liferay/PortletBase.es';

/**
 * MBPortlet handles the actions of replying or editing a
 * message board.
 *
 * @abstract
 * @extends {PortletBase}
 */

class MBPortlet extends PortletBase {
	/**
	 * @inheritDoc
	 */

	created() {
		this.eventHandler_ = new EventHandler();
	}

	/**
	 * @inheritDoc
	 */

	attached() {
		let publishButton = this.one('.button-holder button[type="submit"]');

		if (publishButton) {
			this.eventHandler_.add(
				publishButton.addEventListener('click', e => {
					this.publish_(e);
				})
			);
		}

		let saveButton = this.one('#saveButton');

		if (saveButton) {
			this.eventHandler_.add(
				saveButton.addEventListener('click', e => {
					this.saveDraft_(e);
				})
			);
		}

		let advancedReplyLink = this.one('.advanced-reply');

		if (advancedReplyLink) {
			this.eventHandler_.add(
				advancedReplyLink.addEventListener('click', e => {
					this.openAdvancedReply_(e);
				})
			);
		}

		let searchContainerId = this.ns('messageAttachments');

		Liferay.componentReady(searchContainerId).then(searchContainer => {
			this.eventHandler_.add(
				searchContainer
					.get('contentBox')
					.delegate(
						'click',
						this.removeAttachment_.bind(this),
						'.delete-attachment'
					)
			);

			this.searchContainer_ = searchContainer;
		});

		let viewRemovedAttachmentsLink = document.getElementById(
			'view-removed-attachments-link'
		);

		if (viewRemovedAttachmentsLink) {
			viewRemovedAttachmentsLink.addEventListener('click', () => {
				Liferay.Util.openWindow({
					id: this.namespace + 'openRemovedPageAttachments',
					title: Liferay.Language.get('removed-attachments'),
					uri: this.viewTrashAttachmentsURL,
					dialog: {
						on: {
							visibleChange: event => {
								if (!event.newVal) {
									this.updateRemovedAttachments_();
								}
							}
						}
					}
				});
			});
		}
	}

	/**
	 * @inheritDoc
	 */

	detached() {
		super.detached();
		this.eventHandler_.removeAllListeners();
	}

	/**
	 * Redirects to the advanced reply page
	 * keeping the current message.
	 *
	 * @protected
	 */

	openAdvancedReply_() {
		let inputNode = this.one('#body');
		inputNode.value = window[
			this.ns('replyMessageBody' + this.replyToMessageId)
		].getHTML();

		let form = this.one(
			`[name="${this.ns('advancedReplyFm' + this.replyToMessageId)}"]`
		);

		let advancedReplyInputNode = form.querySelector(
			`[name="${this.ns('body')}"]`
		);

		advancedReplyInputNode.value = inputNode.value;

		submitForm(form);
	}

	/**
	 * Publish the message.
	 *
	 * @protected
	 */

	publish_() {
		this.one('#workflowAction').value = this.constants.ACTION_PUBLISH;
		this.save_();
	}

	/**
	 * Save the message. Before doing that, checks if there are
	 * images that have not been uploaded yet. In that case,
	 * it removes them after asking confirmation to the user.
	 *
	 * @protected
	 */

	save_() {
		let tempImages = this.all('img[data-random-id]');

		if (tempImages.length > 0) {
			if (confirm(this.strings.confirmDiscardImages)) {
				tempImages.forEach(node => {
					node.parentElement.remove();
				});

				this.submitForm_();
			}
		} else {
			this.submitForm_();
		}
	}

	/**
	 * Sends a request to remove the selected attachment.
	 *
	 * @protected
	 * @param {Event} event The click event that triggered the remove action
	 */

	removeAttachment_(event) {
		let link = event.currentTarget;

		let deleteURL = link.getAttribute('data-url');

		fetch(deleteURL, {
			credentials: 'include'
		}).then(() => {
			let searchContainer = this.searchContainer_;

			searchContainer.deleteRow(
				link.ancestor('tr'),
				link.getAttribute('data-rowid')
			);
			searchContainer.updateDataStore();

			this.updateRemovedAttachments_();
		});
	}

	/**
	 * Sends a request to retrieve the deleted attachments
	 *
	 * @protected
	 */

	updateRemovedAttachments_() {
		fetch(this.getAttachmentsURL)
			.then(res => res.json())
			.then(attachments => {
				if (attachments.active.length > 0) {
					let searchContainer = this.searchContainer_;
					let searchContainerData = searchContainer.getData();

					document
						.getElementById(this.namespace + 'fileAttachments')
						.classList.remove('hide');

					attachments.active.forEach(attachment => {
						if (searchContainerData.indexOf(attachment.id) == -1) {
							searchContainer.addRow(
								[
									attachment.title,
									attachment.size,
									`<a class="delete-attachment" data-rowId="${
										attachment.id
									}" data-url="${
										attachment.deleteURL
									}" href="javascript:;">${Liferay.Language.get(
										'move-to-recycle-bin'
									)}</a>`
								],
								attachment.id.toString()
							);

							searchContainer.updateDataStore();
						}
					});
				}

				const deletedAttachmentsElement = document.getElementById(
					'view-removed-attachments-link'
				);

				if (attachments.deleted.length > 0) {
					deletedAttachmentsElement.style.display = 'initial';
					deletedAttachmentsElement.innerHTML =
						Liferay.Util.sub(
							Liferay.Language.get(
								attachments.deleted.length > 1
									? 'x-recently-removed-attachments'
									: 'x-recently-removed-attachment'
							),
							attachments.deleted.length
						) + ' &raquo';
				} else {
					deletedAttachmentsElement.style.display = 'none';
				}
			});
	}

	/**
	 * Updates the attachments to include the checked attachments.
	 *
	 * @protected
	 */

	updateMultipleMBMessageAttachments_() {
		let selectedFileNameContainer = this.one('#selectedFileNameContainer');

		if (selectedFileNameContainer) {
			const inputName = this.ns('selectUploadedFile');

			const input = [].slice.call(
				this.all(`input[name=${inputName}]:checked`)
			);

			const data = input
				.map((item, index) => {
					const id = index;
					const namespace = this.namespace;
					const value = item.value;

					return `<input id="${namespace}selectedFileName${id}" name="${namespace}selectedFileName" type="hidden" value="${value}" />`;
				})
				.join('');

			selectedFileNameContainer.innerHTML = data;
		}
	}

	/**
	 * Submits the message.
	 *
	 * @protected
	 */

	submitForm_() {
		this.one('#' + this.constants.CMD).value = this.currentAction;

		this.updateMultipleMBMessageAttachments_();

		if (this.replyToMessageId) {
			this.one('#body').value = window[
				this.ns('replyMessageBody' + this.replyToMessageId)
			].getHTML();

			submitForm(
				document[this.ns('addQuickReplyFm' + this.replyToMessageId)]
			);
		} else {
			this.one('#body').value = window[this.ns('bodyEditor')].getHTML();

			submitForm(document[this.ns('fm')]);
		}
	}

	/**
	 * Saves the message as a draft.
	 *
	 * @protected
	 */

	saveDraft_() {
		this.one('#workflowAction').value = this.constants.ACTION_SAVE_DRAFT;
		this.save_();
	}
}

/**
 * MBPortlet State definition.
 * @ignore
 * @static
 * @type {!Object}
 */

MBPortlet.STATE = {
	/**
	 * Portlet's constants
	 * @instance
	 * @memberof MBPortlet
	 * @type {!Object}
	 */

	constants: {
		validator: core.isObject
	},

	/**
	 * The current action (CMD.ADD, CMD.UPDATE, ...)
	 * for the message
	 * @instance
	 * @memberof MBPortlet
	 * @type {String}
	 */

	currentAction: {
		validator: core.isString
	},

	/**
	 * The URL to get deleted attachments from
	 * @instance
	 * @memberof MBPortlet
	 * @type {String}
	 */

	getAttachmentsURL: {
		validator: core.isString
	},

	/**
	 * The id of the message that
	 * you are replying to
	 * @instance
	 * @memberof MBPortlet
	 * @type {String}
	 */

	replyToMessageId: {
		validator: core.isString
	},

	/**
	 * Portlet's messages
	 * @instance
	 * @memberof WikiPortlet
	 * @type {Object}
	 */

	strings: {
		validator: core.isObject,
		value: {
			confirmDiscardImages: Liferay.Language.get(
				'uploads-are-in-progress-confirmation'
			)
		}
	},

	/**
	 * The URL to edit deleted attachments
	 * @instance
	 * @memberof MBPortlet
	 * @type {String}
	 */

	viewTrashAttachmentsURL: {
		validator: core.isString
	}
};

export default MBPortlet;
