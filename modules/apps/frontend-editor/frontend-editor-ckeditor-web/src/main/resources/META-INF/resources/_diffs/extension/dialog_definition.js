CKEDITOR.on('dialogDefinition', function(event) {
	if (event.editor === ckEditor) {
		var dialogDefinition = event.data.definition;

		var onShow = dialogDefinition.onShow;

		dialogDefinition.onShow = function() {
			if (typeof onShow === 'function') {
				onShow.apply(this, arguments);
			}

			if (window.top != window.self) {
				var editorElement = this.getParentEditor().container;

				var documentPosition = editorElement.getLast().getDocumentPosition();

				var dialogSize = this.getSize();

				var x =
					documentPosition.x +
					((editorElement.getLast().getSize('width', true) - dialogSize.width) /
						2 -
						window.scrollX);
				var y =
					documentPosition.y +
					((editorElement.getLast().getSize('height', true) -
						dialogSize.height) /
						2 -
						window.scrollY);

				this.move(x, y, false);
			}
		};
	}
});
