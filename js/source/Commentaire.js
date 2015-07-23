
// import Utilitaire from 'Utilitaire.js';

class GroupForm {
  constructor(opts = { fields: [], onUnvalid: () => {}, onValid: () => {}}) {
    this._fields = {};
    this._build(opts.fields);
    this.onUnvalid = opts.onUnvalid;
    this.onValid = opts.onValid;
  }
  // Vérifie que le regex est conforme
  _checkValid(regex, value) {
    return new Promise((resolve, reject) => {
      let correct = false;
      if (regex.rg.test(value)) {
        correct = (regex.type === 'valid');
      } else {
        correct = (regex.type === 'error');
      }

      resolve({
        regex: regex.rg.toString() || '',
        msg: regex.msg || '',
        valid: correct
      });
    });
  }
  _setField(name, obj) {
    this._fields[name] = obj;
    this._fields[name].value = '';
    this._fields[name].valid = false;
    return this;
  }
  _getField(name) {
    return this._fields[name] || null;
  }

  // Parse tous les Regex
  _checkAllRegex(name) {
    const that = this;
    // const currField = this._getField(name);
    return new Promise((resolve, reject) => {
      const currField = that._getField(name);

      // Aucune vérification à faire
      if (!currField || typeof currField.regex === 'undefined' || !currField.regex.length) {
        resolve();
      }
      // Vérifie les retours
      Promise.all(currField.regex.map(regex => {
        return that._checkValid.call(that, regex, currField.value);
      }))
      // Tout est ok
      .then(resp => {
        resolve({
          name: name,
          valid: true,
          data: resp
        });
      }) // En erreur
      .catch(err => {
        reject({
          name: name,
          valid: false,
          data: [err]
        });
      });
    });
  }

  _checkAllRegexMultipleFields(fields, callBack = () => {}) {
    Promise.all(fields.map(test => {
      return this._checkAllRegex.call(this, test);
    }))
    // Tout est ok
    .then(resp => {
      // Parse tous les champs
      resp.map(field => {
        const nonValids = field.data.filter(retour => { return !retour.valid; });
        if (nonValids.length) {
          this._fieldUnvalidated(field.name, nonValids);
          this.onUnvalid();
        } else {
          this._fieldValidated(field.name);
          callBack();
        }
      });
    }).catch(err => {
      Error(err);
    });
  }

  _fieldValidated(name) {
    const currField = this._getField(name);
    currField.valid = true;
    currField.onToggleValid.call(this, currField);
  }
  _fieldUnvalidated(name, errors) {
    this._getField(name).onToggleUnValid.call(this, this._getField(name), errors);
  }
  // Construction des fields en Array
  _getFields() {
    const fields = [];
    for (const fieldKey in this._fields) {
      if (this._fields.hasOwnProperty(fieldKey)) {
        fields.push(this._fields[fieldKey]);
      }
    }
    return fields;
  }

  // Vérifie l'état du formulaire
  _checkForm(_force = true) {
    if (!_force) {
      // Tous leq champs prérequis sont correct
      if (this._getFields().every(field => field.required && field.valid)) {
        this.onValid.call(this, null);
        return true;
      }
    }
    // Execution des vérifications asynchrones
    Promise.all(this._getFields().map(this._checkAllRegex))
     // Tout est ok
    .then(resp => {
      this.onValid.call(this, resp);
      return true;
    }) // En erreur
    .catch(err => {
      this.onUnvalid.call(this, err);
      return false;
    });
  }
  _onFieldUpdated(event) {
    const newVal = $(event.currentTarget).val();
    // On update la valeur
    this._getField(event.data.name).value = newVal;
    this._checkAllRegexMultipleFields([event.data.name], () => {
      this._checkForm(false);
    });
  }
  _buildField(field) {
    // Listeners
    field.selector.on('keyup', { name: field.name }, event => {
      this._onFieldUpdated.call(this, event);
    });
  }
  // Construction dynamique
  _build(fields) {
    if (!fields.length) {
      Error('Field undefined');
    }
    fields.map(field => {
      this._setField(field.name, field);
      this._buildField(field);
    });
  }

  debug() {
    return this._fields;
  }
}

function fieldUnvalid(data, erreurs) {
  console.table(erreurs);
  const domToAdd = erreurs.map(erreur => {
    return `<div>${erreur.msg}</div>`;
  }).join('');
  data.selector.addClass('sign-up-error')
    .next('.input-error').html(domToAdd);
}

function fieldValid(data) {
  data.selector.removeClass('sign-up-error');
}

const registerForm = new GroupForm({
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
  onUnvalid: () => {
    console.log('onUnvalid', registerForm.debug());
    $('#registerSubmit').prop('disabled', 'disabled');
  },
  onValid: () => {
    console.log('onValid');
    $('#registerSubmit').removeAttr('disabled');
  }
});
