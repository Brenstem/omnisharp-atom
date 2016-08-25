"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _omni = require("../server/omni");

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _tsDisposables = require("ts-disposables");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var filter = require("fuzzaldrin").filter;
function calcuateMovement(previous, current) {
    if (!current) return { reset: true, current: current, previous: null };
    var row = Math.abs(current.bufferPosition.row - previous.bufferPosition.row) > 0;
    var column = Math.abs(current.bufferPosition.column - previous.bufferPosition.column) > 3;
    return { reset: row || column || false, previous: previous, current: current };
}
var autoCompleteOptions = {
    WordToComplete: "",
    WantDocumentationForEveryCompletionResult: false,
    WantKind: true,
    WantSnippet: true,
    WantReturnType: true
};
function renderReturnType(returnType) {
    if (returnType === null) {
        return;
    }
    return "Returns: " + returnType;
}
function renderIcon(item) {
    return "<img height=\"16px\" width=\"16px\" src=\"atom://omnisharp-atom/styles/icons/autocomplete_" + item.Kind.toLowerCase() + "@3x.png\" />";
}

var CompletionProvider = function () {
    function CompletionProvider() {
        _classCallCheck(this, CompletionProvider);

        this._initialized = false;
        this.selector = ".source.omnisharp";
        this.disableForSelector = ".source.omnisharp .comment";
        this.inclusionPriority = 1;
        this.suggestionPriority = 10;
        this.excludeLowerPriority = false;
    }

    _createClass(CompletionProvider, [{
        key: "getSuggestions",
        value: function getSuggestions(options) {
            var _this = this;

            if (!this._initialized) this._setupSubscriptions();
            if (this.results && this.previous && calcuateMovement(this.previous, options).reset) {
                this.results = null;
            }
            if (this.results && options.prefix === "." || options.prefix && !_lodash2.default.trim(options.prefix) || !options.prefix || options.activatedManually) {
                this.results = null;
            }
            this.previous = options;
            var buffer = options.editor.getBuffer();
            var end = options.bufferPosition.column;
            var data = buffer.getLines()[options.bufferPosition.row].substring(0, end + 1);
            var lastCharacterTyped = data[end - 1];
            if (!/[A-Z_0-9.]+/i.test(lastCharacterTyped)) {
                return;
            }
            var search = options.prefix;
            if (search === ".") search = "";
            if (!this.results) this.results = _omni.Omni.request(function (solution) {
                return solution.autocomplete(_lodash2.default.clone(autoCompleteOptions));
            }).toPromise();
            var p = this.results;
            if (search) p = p.then(function (s) {
                return filter(s, search, { key: "CompletionText" });
            });
            return p.then(function (response) {
                return response.map(function (s) {
                    return _this._makeSuggestion(s);
                });
            });
        }
    }, {
        key: "onDidInsertSuggestion",
        value: function onDidInsertSuggestion(editor, triggerPosition, suggestion) {
            this.results = null;
        }
    }, {
        key: "dispose",
        value: function dispose() {
            if (this._disposable) this._disposable.dispose();
            this._disposable = null;
            this._initialized = false;
        }
    }, {
        key: "_setupSubscriptions",
        value: function _setupSubscriptions() {
            var _this2 = this;

            if (this._initialized) return;
            var disposable = this._disposable = new _tsDisposables.CompositeDisposable();
            disposable.add(atom.commands.onWillDispatch(function (event) {
                if (event.type === "autocomplete-plus:activate" || event.type === "autocomplete-plus:confirm" || event.type === "autocomplete-plus:cancel") {
                    _this2.results = null;
                }
            }));
            disposable.add(atom.config.observe("omnisharp-atom.useIcons", function (value) {
                _this2._useIcons = value;
            }));
            disposable.add(atom.config.observe("omnisharp-atom.useLeftLabelColumnForSuggestions", function (value) {
                _this2._useLeftLabelColumnForSuggestions = value;
            }));
            this._initialized = true;
        }
    }, {
        key: "_makeSuggestion",
        value: function _makeSuggestion(item) {
            var description = void 0,
                leftLabel = void 0,
                iconHTML = void 0,
                type = void 0;
            if (this._useLeftLabelColumnForSuggestions === true) {
                description = item.RequiredNamespaceImport;
                leftLabel = item.ReturnType;
            } else {
                description = renderReturnType(item.ReturnType);
                leftLabel = "";
            }
            if (this._useIcons === true) {
                iconHTML = renderIcon(item);
                type = item.Kind;
            } else {
                iconHTML = null;
                type = item.Kind.toLowerCase();
            }
            return {
                _search: item.CompletionText,
                snippet: item.Snippet,
                type: type,
                iconHTML: iconHTML,
                displayText: item.DisplayText,
                className: "autocomplete-omnisharp-atom",
                description: description,
                leftLabel: leftLabel
            };
        }
    }]);

    return CompletionProvider;
}();

module.exports = [new CompletionProvider()];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9zZXJ2aWNlcy9jb21wbGV0aW9uLXByb3ZpZGVyLmpzIiwibGliL3NlcnZpY2VzL2NvbXBsZXRpb24tcHJvdmlkZXIudHMiXSwibmFtZXMiOlsiZmlsdGVyIiwicmVxdWlyZSIsImNhbGN1YXRlTW92ZW1lbnQiLCJwcmV2aW91cyIsImN1cnJlbnQiLCJyZXNldCIsInJvdyIsIk1hdGgiLCJhYnMiLCJidWZmZXJQb3NpdGlvbiIsImNvbHVtbiIsImF1dG9Db21wbGV0ZU9wdGlvbnMiLCJXb3JkVG9Db21wbGV0ZSIsIldhbnREb2N1bWVudGF0aW9uRm9yRXZlcnlDb21wbGV0aW9uUmVzdWx0IiwiV2FudEtpbmQiLCJXYW50U25pcHBldCIsIldhbnRSZXR1cm5UeXBlIiwicmVuZGVyUmV0dXJuVHlwZSIsInJldHVyblR5cGUiLCJyZW5kZXJJY29uIiwiaXRlbSIsIktpbmQiLCJ0b0xvd2VyQ2FzZSIsIkNvbXBsZXRpb25Qcm92aWRlciIsIl9pbml0aWFsaXplZCIsInNlbGVjdG9yIiwiZGlzYWJsZUZvclNlbGVjdG9yIiwiaW5jbHVzaW9uUHJpb3JpdHkiLCJzdWdnZXN0aW9uUHJpb3JpdHkiLCJleGNsdWRlTG93ZXJQcmlvcml0eSIsIm9wdGlvbnMiLCJfc2V0dXBTdWJzY3JpcHRpb25zIiwicmVzdWx0cyIsInByZWZpeCIsInRyaW0iLCJhY3RpdmF0ZWRNYW51YWxseSIsImJ1ZmZlciIsImVkaXRvciIsImdldEJ1ZmZlciIsImVuZCIsImRhdGEiLCJnZXRMaW5lcyIsInN1YnN0cmluZyIsImxhc3RDaGFyYWN0ZXJUeXBlZCIsInRlc3QiLCJzZWFyY2giLCJyZXF1ZXN0Iiwic29sdXRpb24iLCJhdXRvY29tcGxldGUiLCJjbG9uZSIsInRvUHJvbWlzZSIsInAiLCJ0aGVuIiwicyIsImtleSIsInJlc3BvbnNlIiwibWFwIiwiX21ha2VTdWdnZXN0aW9uIiwidHJpZ2dlclBvc2l0aW9uIiwic3VnZ2VzdGlvbiIsIl9kaXNwb3NhYmxlIiwiZGlzcG9zZSIsImRpc3Bvc2FibGUiLCJhZGQiLCJhdG9tIiwiY29tbWFuZHMiLCJvbldpbGxEaXNwYXRjaCIsImV2ZW50IiwidHlwZSIsImNvbmZpZyIsIm9ic2VydmUiLCJ2YWx1ZSIsIl91c2VJY29ucyIsIl91c2VMZWZ0TGFiZWxDb2x1bW5Gb3JTdWdnZXN0aW9ucyIsImRlc2NyaXB0aW9uIiwibGVmdExhYmVsIiwiaWNvbkhUTUwiLCJSZXF1aXJlZE5hbWVzcGFjZUltcG9ydCIsIlJldHVyblR5cGUiLCJfc2VhcmNoIiwiQ29tcGxldGlvblRleHQiLCJzbmlwcGV0IiwiU25pcHBldCIsImRpc3BsYXlUZXh0IiwiRGlzcGxheVRleHQiLCJjbGFzc05hbWUiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FDRUEsSUFBTUEsU0FBU0MsUUFBUSxZQUFSLEVBQXNCRCxNQUFyQztBQTJCQSxTQUFBRSxnQkFBQSxDQUEwQkMsUUFBMUIsRUFBb0RDLE9BQXBELEVBQTJFO0FBQ3ZFLFFBQUksQ0FBQ0EsT0FBTCxFQUFjLE9BQU8sRUFBRUMsT0FBTyxJQUFULEVBQWVELFNBQVNBLE9BQXhCLEVBQWlDRCxVQUFVLElBQTNDLEVBQVA7QUFHZCxRQUFNRyxNQUFNQyxLQUFLQyxHQUFMLENBQVNKLFFBQVFLLGNBQVIsQ0FBdUJILEdBQXZCLEdBQTZCSCxTQUFTTSxjQUFULENBQXdCSCxHQUE5RCxJQUFxRSxDQUFqRjtBQUVBLFFBQU1JLFNBQVNILEtBQUtDLEdBQUwsQ0FBU0osUUFBUUssY0FBUixDQUF1QkMsTUFBdkIsR0FBZ0NQLFNBQVNNLGNBQVQsQ0FBd0JDLE1BQWpFLElBQTJFLENBQTFGO0FBQ0EsV0FBTyxFQUFFTCxPQUFPQyxPQUFPSSxNQUFQLElBQWlCLEtBQTFCLEVBQWlDUCxVQUFVQSxRQUEzQyxFQUFxREMsU0FBU0EsT0FBOUQsRUFBUDtBQUNIO0FBRUQsSUFBTU8sc0JBQWtEO0FBQ3BEQyxvQkFBZ0IsRUFEb0M7QUFFcERDLCtDQUEyQyxLQUZTO0FB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SEQsTUFHTztBQUNISiw4QkFBY3pELGlCQUFpQkcsS0FBSzBELFVBQXRCLENBQWQ7QUFDQUgsNEJBQVksRUFBWjtBQUNIO0FBRUQsZ0JBQUksS0FBS0gsU0FBTCxLQUFtQixJQUF2QixFQUE2QjtBQUN6QkksMkJBQVd6RCxXQUFXQyxJQUFYLENBQVg7QUFDQWdELHVCQUFPaEQsS0FBS0MsSUFBWjtBQUNILGFBSEQsTUFHTztBQUNIdUQsMkJBQVcsSUFBWDtBQUNBUix1QkFBT2hELEtBQUtDLElBQUwsQ0FBVUMsV0FBVixFQUFQO0FBQ0g7QUFFRCxtQkFBTztBQUNIeUQseUJBQVMzRCxLQUFLNEQsY0FEWDtBQUVIQyx5QkFBUzdELEtBQUs4RCxPQUZYO0FBR0hkLHNCQUFNQSxJQUhIO0FBSUhRLDBCQUFVQSxRQUpQO0FBS0hPLDZCQUFhL0QsS0FBS2dFLFdBTGY7QUFNSEMsMkJBQVcsNkJBTlI7QUFPSFgsNkJBQWFBLFdBUFY7QUFRSEMsMkJBQVdBO0FBUlIsYUFBUDtBQVVIOzs7Ozs7QUFHTFcsT0FBT0MsT0FBUCxHQUFpQixDQUFDLElBQUloRSxrQkFBSixFQUFELENBQWpCIiwiZmlsZSI6ImxpYi9zZXJ2aWNlcy9jb21wbGV0aW9uLXByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT21uaSB9IGZyb20gXCIuLi9zZXJ2ZXIvb21uaVwiO1xuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gXCJ0cy1kaXNwb3NhYmxlc1wiO1xuY29uc3QgZmlsdGVyID0gcmVxdWlyZShcImZ1enphbGRyaW5cIikuZmlsdGVyO1xuZnVuY3Rpb24gY2FsY3VhdGVNb3ZlbWVudChwcmV2aW91cywgY3VycmVudCkge1xuICAgIGlmICghY3VycmVudClcbiAgICAgICAgcmV0dXJuIHsgcmVzZXQ6IHRydWUsIGN1cnJlbnQ6IGN1cnJlbnQsIHByZXZpb3VzOiBudWxsIH07XG4gICAgY29uc3Qgcm93ID0gTWF0aC5hYnMoY3VycmVudC5idWZmZXJQb3NpdGlvbi5yb3cgLSBwcmV2aW91cy5idWZmZXJQb3NpdGlvbi5yb3cpID4gMDtcbiAgICBjb25zdCBjb2x1bW4gPSBNYXRoLmFicyhjdXJyZW50LmJ1ZmZlclBvc2l0aW9uLmNvbHVtbiAtIHByZXZpb3VzLmJ1ZmZlclBvc2l0aW9uLmNvbHVtbikgPiAzO1xuICAgIHJldHVybiB7IHJlc2V0OiByb3cgfHwgY29sdW1uIHx8IGZhbHNlLCBwcmV2aW91czogcHJldmlvdXMsIGN1cnJlbnQ6IGN1cnJlbnQgfTtcbn1cbmNvbnN0IGF1dG9Db21wbGV0ZU9wdGlvbnMgPSB7XG4gICAgV29yZFRvQ29tcGxldGU6IFwiXCIsXG4gICAgV2FudERvY3VtZW50YXRpb25Gb3JFdmVyeUNvbXBsZXRpb25SZXN1bHQ6IGZhbHNlLFxuICAgIFdhbnRLaW5kOiB0cnVlLFxuICAgIFdhbnRTbmlwcGV0OiB0cnVlLFxuICAgIFdhbnRSZXR1cm5UeXBlOiB0cnVlXG59O1xuZnVuY3Rpb24gcmVuZGVyUmV0dXJuVHlwZShyZXR1cm5UeXBlKSB7XG4gICAgaWYgKHJldHVyblR5cGUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gYFJldHVybnM6ICR7cmV0dXJuVHlwZX1gO1xufVxuZnVuY3Rpb24gcmVuZGVySWNvbihpdGVtKSB7XG4gICAgcmV0dXJuIGA8aW1nIGhlaWdodD1cIjE2cHhcIiB3aWR0aD1cIjE2cHhcIiBzcmM9XCJhdG9tOi8vb21uaXNoYXJwLWF0b20vc3R5bGVzL2ljb25zL2F1dG9jb21wbGV0ZV8ke2l0ZW0uS2luZC50b0xvd2VyQ2FzZSgpfUAzeC5wbmdcIiAvPmA7XG59XG5jbGFzcyBDb21wbGV0aW9uUHJvdmlkZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNlbGVjdG9yID0gXCIuc291cmNlLm9tbmlzaGFycFwiO1xuICAgICAgICB0aGlzLmRpc2FibGVGb3JTZWxlY3RvciA9IFwiLnNvdXJjZS5vbW5pc2hhcnAgLmNvbW1lbnRcIjtcbiAgICAgICAgdGhpcy5pbmNsdXNpb25Qcmlvcml0eSA9IDE7XG4gICAgICAgIHRoaXMuc3VnZ2VzdGlvblByaW9yaXR5ID0gMTA7XG4gICAgICAgIHRoaXMuZXhjbHVkZUxvd2VyUHJpb3JpdHkgPSBmYWxzZTtcbiAgICB9XG4gICAgZ2V0U3VnZ2VzdGlvbnMob3B0aW9ucykge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRpYWxpemVkKVxuICAgICAgICAgICAgdGhpcy5fc2V0dXBTdWJzY3JpcHRpb25zKCk7XG4gICAgICAgIGlmICh0aGlzLnJlc3VsdHMgJiYgdGhpcy5wcmV2aW91cyAmJiBjYWxjdWF0ZU1vdmVtZW50KHRoaXMucHJldmlvdXMsIG9wdGlvbnMpLnJlc2V0KSB7XG4gICAgICAgICAgICB0aGlzLnJlc3VsdHMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJlc3VsdHMgJiYgb3B0aW9ucy5wcmVmaXggPT09IFwiLlwiIHx8IChvcHRpb25zLnByZWZpeCAmJiAhXy50cmltKG9wdGlvbnMucHJlZml4KSkgfHwgIW9wdGlvbnMucHJlZml4IHx8IG9wdGlvbnMuYWN0aXZhdGVkTWFudWFsbHkpIHtcbiAgICAgICAgICAgIHRoaXMucmVzdWx0cyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcmV2aW91cyA9IG9wdGlvbnM7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IG9wdGlvbnMuZWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgICAgICBjb25zdCBlbmQgPSBvcHRpb25zLmJ1ZmZlclBvc2l0aW9uLmNvbHVtbjtcbiAgICAgICAgY29uc3QgZGF0YSA9IGJ1ZmZlci5nZXRMaW5lcygpW29wdGlvbnMuYnVmZmVyUG9zaXRpb24ucm93XS5zdWJzdHJpbmcoMCwgZW5kICsgMSk7XG4gICAgICAgIGNvbnN0IGxhc3RDaGFyYWN0ZXJUeXBlZCA9IGRhdGFbZW5kIC0gMV07XG4gICAgICAgIGlmICghL1tBLVpfMC05Ll0rL2kudGVzdChsYXN0Q2hhcmFjdGVyVHlwZWQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHNlYXJjaCA9IG9wdGlvbnMucHJlZml4O1xuICAgICAgICBpZiAoc2VhcmNoID09PSBcIi5cIilcbiAgICAgICAgICAgIHNlYXJjaCA9IFwiXCI7XG4gICAgICAgIGlmICghdGhpcy5yZXN1bHRzKVxuICAgICAgICAgICAgdGhpcy5yZXN1bHRzID0gT21uaS5yZXF1ZXN0KHNvbHV0aW9uID0+IHNvbHV0aW9uLmF1dG9jb21wbGV0ZShfLmNsb25lKGF1dG9Db21wbGV0ZU9wdGlvbnMpKSkudG9Qcm9taXNlKCk7XG4gICAgICAgIGxldCBwID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBpZiAoc2VhcmNoKVxuICAgICAgICAgICAgcCA9IHAudGhlbihzID0+IGZpbHRlcihzLCBzZWFyY2gsIHsga2V5OiBcIkNvbXBsZXRpb25UZXh0XCIgfSkpO1xuICAgICAgICByZXR1cm4gcC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLm1hcChzID0+IHRoaXMuX21ha2VTdWdnZXN0aW9uKHMpKSk7XG4gICAgfVxuICAgIG9uRGlkSW5zZXJ0U3VnZ2VzdGlvbihlZGl0b3IsIHRyaWdnZXJQb3NpdGlvbiwgc3VnZ2VzdGlvbikge1xuICAgICAgICB0aGlzLnJlc3VsdHMgPSBudWxsO1xuICAgIH1cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICBpZiAodGhpcy5fZGlzcG9zYWJsZSlcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9kaXNwb3NhYmxlID0gbnVsbDtcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgX3NldHVwU3Vic2NyaXB0aW9ucygpIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpemVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBkaXNwb3NhYmxlID0gdGhpcy5fZGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgICAgIGRpc3Bvc2FibGUuYWRkKGF0b20uY29tbWFuZHMub25XaWxsRGlzcGF0Y2goKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gXCJhdXRvY29tcGxldGUtcGx1czphY3RpdmF0ZVwiIHx8IGV2ZW50LnR5cGUgPT09IFwiYXV0b2NvbXBsZXRlLXBsdXM6Y29uZmlybVwiIHx8IGV2ZW50LnR5cGUgPT09IFwiYXV0b2NvbXBsZXRlLXBsdXM6Y2FuY2VsXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdHMgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIGRpc3Bvc2FibGUuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoXCJvbW5pc2hhcnAtYXRvbS51c2VJY29uc1wiLCAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3VzZUljb25zID0gdmFsdWU7XG4gICAgICAgIH0pKTtcbiAgICAgICAgZGlzcG9zYWJsZS5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZShcIm9tbmlzaGFycC1hdG9tLnVzZUxlZnRMYWJlbENvbHVtbkZvclN1Z2dlc3Rpb25zXCIsICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fdXNlTGVmdExhYmVsQ29sdW1uRm9yU3VnZ2VzdGlvbnMgPSB2YWx1ZTtcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLl9pbml0aWFsaXplZCA9IHRydWU7XG4gICAgfVxuICAgIF9tYWtlU3VnZ2VzdGlvbihpdGVtKSB7XG4gICAgICAgIGxldCBkZXNjcmlwdGlvbiwgbGVmdExhYmVsLCBpY29uSFRNTCwgdHlwZTtcbiAgICAgICAgaWYgKHRoaXMuX3VzZUxlZnRMYWJlbENvbHVtbkZvclN1Z2dlc3Rpb25zID09PSB0cnVlKSB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9IGl0ZW0uUmVxdWlyZWROYW1lc3BhY2VJbXBvcnQ7XG4gICAgICAgICAgICBsZWZ0TGFiZWwgPSBpdGVtLlJldHVyblR5cGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9IHJlbmRlclJldHVyblR5cGUoaXRlbS5SZXR1cm5UeXBlKTtcbiAgICAgICAgICAgIGxlZnRMYWJlbCA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3VzZUljb25zID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpY29uSFRNTCA9IHJlbmRlckljb24oaXRlbSk7XG4gICAgICAgICAgICB0eXBlID0gaXRlbS5LaW5kO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWNvbkhUTUwgPSBudWxsO1xuICAgICAgICAgICAgdHlwZSA9IGl0ZW0uS2luZC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBfc2VhcmNoOiBpdGVtLkNvbXBsZXRpb25UZXh0LFxuICAgICAgICAgICAgc25pcHBldDogaXRlbS5TbmlwcGV0LFxuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIGljb25IVE1MOiBpY29uSFRNTCxcbiAgICAgICAgICAgIGRpc3BsYXlUZXh0OiBpdGVtLkRpc3BsYXlUZXh0LFxuICAgICAgICAgICAgY2xhc3NOYW1lOiBcImF1dG9jb21wbGV0ZS1vbW5pc2hhcnAtYXRvbVwiLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgbGVmdExhYmVsOiBsZWZ0TGFiZWwsXG4gICAgICAgIH07XG4gICAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBbbmV3IENvbXBsZXRpb25Qcm92aWRlcigpXTtcbiIsImltcG9ydCB7T21uaX0gZnJvbSBcIi4uL3NlcnZlci9vbW5pXCI7XHJcbmltcG9ydCB7TW9kZWxzfSBmcm9tIFwib21uaXNoYXJwLWNsaWVudFwiO1xyXG5pbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XHJcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgSURpc3Bvc2FibGV9IGZyb20gXCJ0cy1kaXNwb3NhYmxlc1wiO1xyXG5jb25zdCBmaWx0ZXIgPSByZXF1aXJlKFwiZnV6emFsZHJpblwiKS5maWx0ZXI7XHJcblxyXG5pbnRlcmZhY2UgUmVxdWVzdE9wdGlvbnMge1xyXG4gICAgZWRpdG9yOiBBdG9tLlRleHRFZGl0b3I7XHJcbiAgICBidWZmZXJQb3NpdGlvbjogVGV4dEJ1ZmZlci5Qb2ludDsgLy8gdGhlIHBvc2l0aW9uIG9mIHRoZSBjdXJzb3JcclxuICAgIHByZWZpeDogc3RyaW5nO1xyXG4gICAgc2NvcGVEZXNjcmlwdG9yOiB7IHNjb3Blczogc3RyaW5nW10gfTtcclxuICAgIGFjdGl2YXRlZE1hbnVhbGx5OiBib29sZWFuO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgU3VnZ2VzdGlvbiB7XHJcbiAgICAvL0VpdGhlciB0ZXh0IG9yIHNuaXBwZXQgaXMgcmVxdWlyZWRcclxuICAgIHRleHQ/OiBzdHJpbmc7XHJcbiAgICBzbmlwcGV0Pzogc3RyaW5nO1xyXG4gICAgZGlzcGxheVRleHQ/OiBzdHJpbmc7XHJcbiAgICByZXBsYWNlbWVudFByZWZpeD86IHN0cmluZztcclxuICAgIHR5cGU6IHN0cmluZztcclxuICAgIGxlZnRMYWJlbD86IHN0cmluZztcclxuICAgIGxlZnRMYWJlbEhUTUw/OiBzdHJpbmc7XHJcbiAgICByaWdodExhYmVsPzogc3RyaW5nO1xyXG4gICAgcmlnaHRMYWJlbEhUTUw/OiBzdHJpbmc7XHJcbiAgICBpY29uSFRNTD86IHN0cmluZztcclxuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xyXG4gICAgZGVzY3JpcHRpb25Nb3JlVVJMPzogc3RyaW5nO1xyXG4gICAgY2xhc3NOYW1lPzogc3RyaW5nO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjYWxjdWF0ZU1vdmVtZW50KHByZXZpb3VzOiBSZXF1ZXN0T3B0aW9ucywgY3VycmVudDogUmVxdWVzdE9wdGlvbnMpIHtcclxuICAgIGlmICghY3VycmVudCkgcmV0dXJuIHsgcmVzZXQ6IHRydWUsIGN1cnJlbnQ6IGN1cnJlbnQsIHByZXZpb3VzOiBudWxsIH07XHJcbiAgICAvLyBJZiB0aGUgcm93IGNoYW5nZXMgd2UgbW92ZWQgbGluZXMsIHdlIHNob3VsZCByZWZldGNoIHRoZSBjb21wbGV0aW9uc1xyXG4gICAgLy8gKElzIGl0IHBvc3NpYmxlIGl0IHdpbGwgYmUgdGhlIHNhbWUgc2V0PylcclxuICAgIGNvbnN0IHJvdyA9IE1hdGguYWJzKGN1cnJlbnQuYnVmZmVyUG9zaXRpb24ucm93IC0gcHJldmlvdXMuYnVmZmVyUG9zaXRpb24ucm93KSA+IDA7XHJcbiAgICAvLyBJZiB0aGUgY29sdW1uIGp1bXBlZCwgbGV0cyBnZXQgdGhlbSBhZ2FpbiB0byBiZSBzYWZlLlxyXG4gICAgY29uc3QgY29sdW1uID0gTWF0aC5hYnMoY3VycmVudC5idWZmZXJQb3NpdGlvbi5jb2x1bW4gLSBwcmV2aW91cy5idWZmZXJQb3NpdGlvbi5jb2x1bW4pID4gMztcclxuICAgIHJldHVybiB7IHJlc2V0OiByb3cgfHwgY29sdW1uIHx8IGZhbHNlLCBwcmV2aW91czogcHJldmlvdXMsIGN1cnJlbnQ6IGN1cnJlbnQgfTtcclxufVxyXG5cclxuY29uc3QgYXV0b0NvbXBsZXRlT3B0aW9ucyA9IDxNb2RlbHMuQXV0b0NvbXBsZXRlUmVxdWVzdD57XHJcbiAgICBXb3JkVG9Db21wbGV0ZTogXCJcIixcclxuICAgIFdhbnREb2N1bWVudGF0aW9uRm9yRXZlcnlDb21wbGV0aW9uUmVzdWx0OiBmYWxzZSxcclxuICAgIFdhbnRLaW5kOiB0cnVlLFxyXG4gICAgV2FudFNuaXBwZXQ6IHRydWUsXHJcbiAgICBXYW50UmV0dXJuVHlwZTogdHJ1ZVxyXG59O1xyXG5cclxuZnVuY3Rpb24gcmVuZGVyUmV0dXJuVHlwZShyZXR1cm5UeXBlOiBzdHJpbmcpIHtcclxuICAgIGlmIChyZXR1cm5UeXBlID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGBSZXR1cm5zOiAke3JldHVyblR5cGV9YDtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVySWNvbihpdGVtOiBNb2RlbHMuQXV0b0NvbXBsZXRlUmVzcG9uc2UpIHtcclxuICAgIC8vIHRvZG86IG1vdmUgYWRkaXRpb25hbCBzdHlsaW5nIHRvIGNzc1xyXG4gICAgcmV0dXJuIGA8aW1nIGhlaWdodD1cIjE2cHhcIiB3aWR0aD1cIjE2cHhcIiBzcmM9XCJhdG9tOi8vb21uaXNoYXJwLWF0b20vc3R5bGVzL2ljb25zL2F1dG9jb21wbGV0ZV8ke2l0ZW0uS2luZC50b0xvd2VyQ2FzZSgpfUAzeC5wbmdcIiAvPmA7XHJcbn1cclxuXHJcbmNsYXNzIENvbXBsZXRpb25Qcm92aWRlciBpbXBsZW1lbnRzIElEaXNwb3NhYmxlIHtcclxuICAgIHByaXZhdGUgX2Rpc3Bvc2FibGU6IENvbXBvc2l0ZURpc3Bvc2FibGU7XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuXHJcbiAgICBwcml2YXRlIF91c2VJY29uczogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgX3VzZUxlZnRMYWJlbENvbHVtbkZvclN1Z2dlc3Rpb25zOiBib29sZWFuO1xyXG5cclxuICAgIHByaXZhdGUgcHJldmlvdXM6IFJlcXVlc3RPcHRpb25zO1xyXG4gICAgcHJpdmF0ZSByZXN1bHRzOiBQcm9taXNlPE1vZGVscy5BdXRvQ29tcGxldGVSZXNwb25zZVtdPjtcclxuXHJcbiAgICBwdWJsaWMgc2VsZWN0b3IgPSBcIi5zb3VyY2Uub21uaXNoYXJwXCI7XHJcbiAgICBwdWJsaWMgZGlzYWJsZUZvclNlbGVjdG9yID0gXCIuc291cmNlLm9tbmlzaGFycCAuY29tbWVudFwiO1xyXG4gICAgcHVibGljIGluY2x1c2lvblByaW9yaXR5ID0gMTtcclxuICAgIHB1YmxpYyBzdWdnZXN0aW9uUHJpb3JpdHkgPSAxMDtcclxuICAgIHB1YmxpYyBleGNsdWRlTG93ZXJQcmlvcml0eSA9IGZhbHNlO1xyXG5cclxuICAgIHB1YmxpYyBnZXRTdWdnZXN0aW9ucyhvcHRpb25zOiBSZXF1ZXN0T3B0aW9ucyk6IFByb21pc2U8U3VnZ2VzdGlvbltdPiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0aWFsaXplZCkgdGhpcy5fc2V0dXBTdWJzY3JpcHRpb25zKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnJlc3VsdHMgJiYgdGhpcy5wcmV2aW91cyAmJiBjYWxjdWF0ZU1vdmVtZW50KHRoaXMucHJldmlvdXMsIG9wdGlvbnMpLnJlc2V0KSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzdWx0cyA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5yZXN1bHRzICYmIG9wdGlvbnMucHJlZml4ID09PSBcIi5cIiB8fCAob3B0aW9ucy5wcmVmaXggJiYgIV8udHJpbShvcHRpb25zLnByZWZpeCkpIHx8ICFvcHRpb25zLnByZWZpeCB8fCBvcHRpb25zLmFjdGl2YXRlZE1hbnVhbGx5KSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzdWx0cyA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnByZXZpb3VzID0gb3B0aW9ucztcclxuXHJcbiAgICAgICAgY29uc3QgYnVmZmVyID0gb3B0aW9ucy5lZGl0b3IuZ2V0QnVmZmVyKCk7XHJcbiAgICAgICAgY29uc3QgZW5kID0gb3B0aW9ucy5idWZmZXJQb3NpdGlvbi5jb2x1bW47XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBidWZmZXIuZ2V0TGluZXMoKVtvcHRpb25zLmJ1ZmZlclBvc2l0aW9uLnJvd10uc3Vic3RyaW5nKDAsIGVuZCArIDEpO1xyXG4gICAgICAgIGNvbnN0IGxhc3RDaGFyYWN0ZXJUeXBlZCA9IGRhdGFbZW5kIC0gMV07XHJcblxyXG4gICAgICAgIGlmICghL1tBLVpfMC05Ll0rL2kudGVzdChsYXN0Q2hhcmFjdGVyVHlwZWQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzZWFyY2ggPSBvcHRpb25zLnByZWZpeDtcclxuICAgICAgICBpZiAoc2VhcmNoID09PSBcIi5cIilcclxuICAgICAgICAgICAgc2VhcmNoID0gXCJcIjtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLnJlc3VsdHMpIHRoaXMucmVzdWx0cyA9IE9tbmkucmVxdWVzdChzb2x1dGlvbiA9PiBzb2x1dGlvbi5hdXRvY29tcGxldGUoXy5jbG9uZShhdXRvQ29tcGxldGVPcHRpb25zKSkpLnRvUHJvbWlzZSgpO1xyXG5cclxuICAgICAgICBsZXQgcCA9IHRoaXMucmVzdWx0cztcclxuICAgICAgICBpZiAoc2VhcmNoKVxyXG4gICAgICAgICAgICBwID0gcC50aGVuKHMgPT4gZmlsdGVyKHMsIHNlYXJjaCwgeyBrZXk6IFwiQ29tcGxldGlvblRleHRcIiB9KSk7XHJcblxyXG4gICAgICAgIHJldHVybiBwLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UubWFwKHMgPT4gdGhpcy5fbWFrZVN1Z2dlc3Rpb24ocykpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25EaWRJbnNlcnRTdWdnZXN0aW9uKGVkaXRvcjogQXRvbS5UZXh0RWRpdG9yLCB0cmlnZ2VyUG9zaXRpb246IFRleHRCdWZmZXIuUG9pbnQsIHN1Z2dlc3Rpb246IGFueSkge1xyXG4gICAgICAgIHRoaXMucmVzdWx0cyA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRpc3Bvc2UoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2Rpc3Bvc2FibGUpXHJcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2FibGUuZGlzcG9zZSgpO1xyXG5cclxuICAgICAgICB0aGlzLl9kaXNwb3NhYmxlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pbml0aWFsaXplZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3NldHVwU3Vic2NyaXB0aW9ucygpIHtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgZGlzcG9zYWJsZSA9IHRoaXMuX2Rpc3Bvc2FibGUgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xyXG5cclxuICAgICAgICAvLyBDbGVhciB3aGVuIGF1dG8tY29tcGxldGUgaXMgb3BlbmluZy5cclxuICAgICAgICAvLyBUT0RPOiBVcGRhdGUgYXRvbSB0eXBpbmdzXHJcbiAgICAgICAgZGlzcG9zYWJsZS5hZGQoYXRvbS5jb21tYW5kcy5vbldpbGxEaXNwYXRjaCgoZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSBcImF1dG9jb21wbGV0ZS1wbHVzOmFjdGl2YXRlXCIgfHwgZXZlbnQudHlwZSA9PT0gXCJhdXRvY29tcGxldGUtcGx1czpjb25maXJtXCIgfHwgZXZlbnQudHlwZSA9PT0gXCJhdXRvY29tcGxldGUtcGx1czpjYW5jZWxcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN1bHRzID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogRGlzcG9zZSBvZiB0aGVzZSB3aGVuIG5vdCBuZWVkZWRcclxuICAgICAgICBkaXNwb3NhYmxlLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKFwib21uaXNoYXJwLWF0b20udXNlSWNvbnNcIiwgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VzZUljb25zID0gdmFsdWU7XHJcbiAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICBkaXNwb3NhYmxlLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKFwib21uaXNoYXJwLWF0b20udXNlTGVmdExhYmVsQ29sdW1uRm9yU3VnZ2VzdGlvbnNcIiwgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VzZUxlZnRMYWJlbENvbHVtbkZvclN1Z2dlc3Rpb25zID0gdmFsdWU7XHJcbiAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICB0aGlzLl9pbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfbWFrZVN1Z2dlc3Rpb24oaXRlbTogTW9kZWxzLkF1dG9Db21wbGV0ZVJlc3BvbnNlKSB7XHJcbiAgICAgICAgbGV0IGRlc2NyaXB0aW9uOiBhbnksIGxlZnRMYWJlbDogYW55LCBpY29uSFRNTDogYW55LCB0eXBlOiBhbnk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl91c2VMZWZ0TGFiZWxDb2x1bW5Gb3JTdWdnZXN0aW9ucyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9IGl0ZW0uUmVxdWlyZWROYW1lc3BhY2VJbXBvcnQ7XHJcbiAgICAgICAgICAgIGxlZnRMYWJlbCA9IGl0ZW0uUmV0dXJuVHlwZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9IHJlbmRlclJldHVyblR5cGUoaXRlbS5SZXR1cm5UeXBlKTtcclxuICAgICAgICAgICAgbGVmdExhYmVsID0gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl91c2VJY29ucyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBpY29uSFRNTCA9IHJlbmRlckljb24oaXRlbSk7XHJcbiAgICAgICAgICAgIHR5cGUgPSBpdGVtLktpbmQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWNvbkhUTUwgPSBudWxsO1xyXG4gICAgICAgICAgICB0eXBlID0gaXRlbS5LaW5kLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBfc2VhcmNoOiBpdGVtLkNvbXBsZXRpb25UZXh0LFxyXG4gICAgICAgICAgICBzbmlwcGV0OiBpdGVtLlNuaXBwZXQsXHJcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgICAgIGljb25IVE1MOiBpY29uSFRNTCxcclxuICAgICAgICAgICAgZGlzcGxheVRleHQ6IGl0ZW0uRGlzcGxheVRleHQsXHJcbiAgICAgICAgICAgIGNsYXNzTmFtZTogXCJhdXRvY29tcGxldGUtb21uaXNoYXJwLWF0b21cIixcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICBsZWZ0TGFiZWw6IGxlZnRMYWJlbCxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFtuZXcgQ29tcGxldGlvblByb3ZpZGVyKCldO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
