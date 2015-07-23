
// import Utilitaire from 'Utilitaire.js';

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var GroupForm = (function () {
  function GroupForm() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? { fields: [], onUnvalid: function onUnvalid() {}, onValid: function onValid() {} } : arguments[0];

    _classCallCheck(this, GroupForm);

    this._fields = {};
    this._build(opts.fields);
    this.onUnvalid = opts.onUnvalid;
    this.onValid = opts.onValid;
  }

  // Vérifie que le regex est conforme

  _createClass(GroupForm, [{
    key: '_checkValid',
    value: function _checkValid(regex, value) {
      return new Promise(function (resolve, reject) {
        var correct = false;
        if (regex.rg.test(value)) {
          correct = regex.type === 'valid';
        } else {
          correct = regex.type === 'error';
        }

        resolve({
          regex: regex.rg.toString() || '',
          msg: regex.msg || '',
          valid: correct
        });
      });
    }
  }, {
    key: '_setField',
    value: function _setField(name, obj) {
      this._fields[name] = obj;
      this._fields[name].value = '';
      this._fields[name].valid = false;
      return this;
    }
  }, {
    key: '_getField',
    value: function _getField(name) {
      return this._fields[name] || null;
    }

    // Parse tous les Regex
  }, {
    key: '_checkAllRegex',
    value: function _checkAllRegex(name) {
      var that = this;
      // const currField = this._getField(name);
      return new Promise(function (resolve, reject) {
        var currField = that._getField(name);

        // Aucune vérification à faire
        if (!currField || typeof currField.regex === 'undefined' || !currField.regex.length) {
          resolve();
        }
        // Vérifie les retours
        Promise.all(currField.regex.map(function (regex) {
          return that._checkValid.call(that, regex, currField.value);
        }))
        // Tout est ok
        .then(function (resp) {
          resolve({
            name: name,
            valid: true,
            data: resp
          });
        }) // En erreur
        ['catch'](function (err) {
          reject({
            name: name,
            valid: false,
            data: [err]
          });
        });
      });
    }
  }, {
    key: '_checkAllRegexMultipleFields',
    value: function _checkAllRegexMultipleFields(fields) {
      var _this = this;

      var callBack = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

      Promise.all(fields.map(function (test) {
        return _this._checkAllRegex.call(_this, test);
      }))
      // Tout est ok
      .then(function (resp) {
        // Parse tous les champs
        resp.map(function (field) {
          var nonValids = field.data.filter(function (retour) {
            return !retour.valid;
          });
          if (nonValids.length) {
            _this._fieldUnvalidated(field.name, nonValids);
            _this.onUnvalid();
          } else {
            _this._fieldValidated(field.name);
            callBack();
          }
        });
      })['catch'](function (err) {
        Error(err);
      });
    }
  }, {
    key: '_fieldValidated',
    value: function _fieldValidated(name) {
      var currField = this._getField(name);
      currField.valid = true;
      currField.onToggleValid.call(this, currField);
    }
  }, {
    key: '_fieldUnvalidated',
    value: function _fieldUnvalidated(name, errors) {
      this._getField(name).onToggleUnValid.call(this, this._getField(name), errors);
    }

    // Construction des fields en Array
  }, {
    key: '_getFields',
    value: function _getFields() {
      var fields = [];
      for (var fieldKey in this._fields) {
        if (this._fields.hasOwnProperty(fieldKey)) {
          fields.push(this._fields[fieldKey]);
        }
      }
      return fields;
    }

    // Vérifie l'état du formulaire
  }, {
    key: '_checkForm',
    value: function _checkForm() {
      var _this2 = this;

      var _force = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      if (!_force) {
        // Tous leq champs prérequis sont correct
        if (this._getFields().every(function (field) {
          return field.required && field.valid;
        })) {
          this.onValid.call(this, null);
          return true;
        }
      }
      // Execution des vérifications asynchrones
      Promise.all(this._getFields().map(this._checkAllRegex))
      // Tout est ok
      .then(function (resp) {
        _this2.onValid.call(_this2, resp);
        return true;
      }) // En erreur
      ['catch'](function (err) {
        _this2.onUnvalid.call(_this2, err);
        return false;
      });
    }
  }, {
    key: '_onFieldUpdated',
    value: function _onFieldUpdated(event) {
      var _this3 = this;

      var newVal = $(event.currentTarget).val();
      // On update la valeur
      this._getField(event.data.name).value = newVal;
      this._checkAllRegexMultipleFields([event.data.name], function () {
        _this3._checkForm(false);
      });
    }
  }, {
    key: '_buildField',
    value: function _buildField(field) {
      var _this4 = this;

      // Listeners
      field.selector.on('keyup', { name: field.name }, function (event) {
        _this4._onFieldUpdated.call(_this4, event);
      });
    }

    // Construction dynamique
  }, {
    key: '_build',
    value: function _build(fields) {
      var _this5 = this;

      if (!fields.length) {
        Error('Field undefined');
      }
      fields.map(function (field) {
        _this5._setField(field.name, field);
        _this5._buildField(field);
      });
    }
  }, {
    key: 'debug',
    value: function debug() {
      return this._fields;
    }
  }]);

  return GroupForm;
})();

function fieldUnvalid(data, erreurs) {
  console.table(erreurs);
  var domToAdd = erreurs.map(function (erreur) {
    return '<div>' + erreur.msg + '</div>';
  }).join('');
  data.selector.addClass('sign-up-error').next('.input-error').html(domToAdd);
}

function fieldValid(data) {
  data.selector.removeClass('sign-up-error');
}

var registerForm = new GroupForm({
  fields: [{
    name: 'compte',
    selector: $('#registerName'),
    required: true,
    regex: [{
      rg: /\d/,
      msg: 'Non numérique',
      type: 'error'
    }, {
      rg: /\d/,
      msg: 'Pas d\'espace',
      type: 'error'
    }],
    onToggleUnValid: fieldUnvalid,
    onToggleValid: fieldValid
  }, {
    name: 'mdp',
    selector: $('#registerPassword'),
    required: true,
    regex: [{
      rg: /\d/,
      type: 'valid',
      msg: 'Incorrect'
    }],
    onToggleUnValid: fieldUnvalid,
    onToggleValid: fieldValid
  }, {
    name: 'email',
    selector: $('#registerEmail'),
    required: true,
    regex: [{
      rg: /\d/,
      type: 'valid',
      msg: 'Incorrect'
    }],
    onToggleUnValid: fieldUnvalid,
    onToggleValid: fieldValid
  }],
  onUnvalid: function onUnvalid() {
    console.log('onUnvalid', registerForm.debug());
    $('#registerSubmit').prop('disabled', 'disabled');
  },
  onValid: function onValid() {
    console.log('onValid');
    $('#registerSubmit').removeAttr('disabled');
  }
});