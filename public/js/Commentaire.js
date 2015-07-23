
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
      console.log('coucou');
      return new Promise(function (resolve, reject) {
        var correct = false;
        if (regex.rg.test(value)) {
          correct = !(regex.type === 'error');
        } else {
          correct = regex.type === 'error';
        }

        if (correct) {
          resolve('regex ' + regex.toString() + ' valide');
        } else {
          reject({ regex: regex.rg.toString(), msg: regex.msg || 'ouat' });
        }
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
      var _this = this;

      console.log('name~', name);
      return new Promise(function (resolve, reject) {
        console.log('name~2', name, _this._fields);
        var currField = _this._getField(name);
        // Aucune vérification à faire
        if (!currField || typeof currField.regex === 'undefined' || !currField.regex.length) {
          resolve();
        }
        // Vérifie les retours
        Promise.all(currField.regex.map(function (test) {
          _this._checkValid.call(_this, test);
        }))
        // Tout est ok
        .then(function (resp) {
          console.log('_checkAllRegex:then', resp);
          resolve({
            name: name,
            valid: true,
            data: resp
          });
        }) // En erreur
        ['catch'](function (err) {
          console.log('_checkAllRegex:err', err);
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
      var _this2 = this;

      Promise.all(fields.map(function (test) {
        _this2._checkAllRegex.call(_this2, test);
      }))
      // Tout est ok
      .then(function (resp) {
        console.log('_checkAllRegexMultipleFields:Then', resp);
        if (resp.valid) {
          _this2._fieldValidated(name, resp.data);
          _this2._checkForm(name);
        } else {
          _this2._fieldUnvalidated(name, resp.data);
          _this2.onUnvalid();
          return false;
        }
      })['catch'](function (err) {
        console.log('_checkAllRegexMultipleFields:Err', err);
      });
    }
  }, {
    key: '_fieldValidated',
    value: function _fieldValidated(name) {
      var currField = this._getField(name);
      currField.valid = true;
      currField.onToggleValid.call(this, this._getField(name));
    }
  }, {
    key: '_fieldUnvalidated',
    value: function _fieldUnvalidated(name, errors) {
      console.log('_fieldUnvalidated');
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
      var _this3 = this;

      // Execution des vérifications asynchrones
      Promise.all(this._getFields().map(this._checkAllRegex))
      // Tout est ok
      .then(function (resp) {
        console.log('_checkForm:GG', resp);
        _this3.onValid.call(_this3, resp);
      }) // En erreur
      ['catch'](function (err) {
        console.log('_checkForm:KO', err);
        _this3.onUnvalid.call(_this3, err);
      });
    }
  }, {
    key: '_onFieldUpdated',
    value: function _onFieldUpdated(event) {
      var _this4 = this;

      var newVal = $(event.currentTarget).val();
      // On update la valeur
      this._getField(event.data.name).value = newVal;

      this._checkAllRegexMultipleFields([event.data.name]).then(function (resp) {
        console.log('_onFieldUpdated:Then', resp);
        if (resp.valid) {
          _this4._fieldValidated(name, resp.data);
          // this._checkForm(name);
        } else {
            _this4._fieldUnvalidated(name, resp.data);
            _this4.onUnvalid();
            return false;
          }
      })['catch'](function (err) {
        console.log('_onFieldUpdated:Err', err);
      });
    }
  }, {
    key: '_buildField',
    value: function _buildField(field) {
      var _this5 = this;

      // Listeners
      field.selector.on('keyup', { name: field.name }, function (event) {
        _this5._onFieldUpdated.call(_this5, event);
      });
    }

    // Construction dynamique
  }, {
    key: '_build',
    value: function _build(fields) {
      var _this6 = this;

      if (!fields.length) {
        throw Error('Aucun champ défini');
      }
      fields.map(function (field) {
        _this6._setField(field.name, field);
        _this6._buildField(field);
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
  console.log('fieldUnvalid', erreurs);
  data.selector.addClass('sign-up-error').next('.input-error').html(erreurs.map(function (erreur) {
    return '<div>' + erreur.msg + '</div>';
  }).join(''));
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
      rg: /\g/,
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
      type: 'valid'
    }],
    onToggleUnValid: fieldUnvalid,
    onToggleValid: fieldValid
  }, {
    name: 'email',
    selector: $('#registerEmail'),
    required: true,
    regex: [{
      rg: /\d/,
      type: 'valid'
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
    $('#registerSubmit').removeProp('disabled');
  }
});