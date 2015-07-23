
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
    console.log('coucou');
    return new Promise((resolve, reject) => {
      let correct = false;
      if (regex.rg.test(value)) {
        correct = !(regex.type === 'error');
      } else {
        correct = (regex.type === 'error');
      }

      if (correct) {
        resolve(`regex ${regex.toString()} valide`);
      } else {
        reject({ regex: regex.rg.toString(), msg: regex.msg || 'ouat' });
      }
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
    console.log('name~', name);
    return new Promise((resolve, reject) => {
      console.log('name~2', name, this._fields);
      const currField = this._getField(name);
      // Aucune vérification à faire
      if (!currField || typeof currField.regex === 'undefined' || !currField.regex.length) {
        resolve();
      }
      // Vérifie les retours
      Promise.all(currField.regex.map(test => {
        this._checkValid.call(this, test);
      }))
      // Tout est ok
      .then(resp => {
        console.log('_checkAllRegex:then', resp);
        resolve({
          name,
          valid: true,
          data: resp
        });
      }) // En erreur
      .catch(err => {
        console.log('_checkAllRegex:err', err);
        reject({
          name,
          valid: false,
          data: [err]
        });
      });
    });
  }

  _checkAllRegexMultipleFields(fields) {
    Promise.all(fields.map(test => {
      this._checkAllRegex.call(this, test);
    }))
    // Tout est ok
    .then(resp => {
      console.log('_checkAllRegexMultipleFields:Then', resp);
      if (resp.valid) {
        this._fieldValidated(name, resp.data);
        this._checkForm(name);
      } else {
        this._fieldUnvalidated(name, resp.data);
        this.onUnvalid();
        return false;
      }
    }).catch(err => {
      console.log('_checkAllRegexMultipleFields:Err', err);
    });
  }

  _fieldValidated(name) {
    const currField = this._getField(name);
    currField.valid = true;
    currField.onToggleValid.call(this, this._getField(name));
  }
  _fieldUnvalidated(name, errors) {
    console.log('_fieldUnvalidated');
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
  _checkForm() {
    // Execution des vérifications asynchrones
    Promise.all(this._getFields().map(this._checkAllRegex))
     // Tout est ok
    .then(resp => {
      console.log('_checkForm:GG', resp);
      this.onValid.call(this, resp);
    }) // En erreur
    .catch(err => {
      console.log('_checkForm:KO', err);
      this.onUnvalid.call(this, err);
    });
  }
  _onFieldUpdated(event) {
    const newVal = $(event.currentTarget).val();
    // On update la valeur
    this._getField(event.data.name).value = newVal;

    this._checkAllRegexMultipleFields([event.data.name]).then(resp => {
      console.log('_onFieldUpdated:Then', resp);
      if (resp.valid) {
        this._fieldValidated(name, resp.data);
        // this._checkForm(name);
      } else {
        this._fieldUnvalidated(name, resp.data);
        this.onUnvalid();
        return false;
      }
    }).catch(err => {
      console.log('_onFieldUpdated:Err', err);
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
      throw Error('Aucun champ défini');
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
  console.log('fieldUnvalid', erreurs);
  data.selector.addClass('sign-up-error').
    next('.input-error').html(erreurs.map(erreur => {
      return `<div>${erreur.msg}</div>`;
    }).join(''));
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
  onUnvalid: () => {
    console.log('onUnvalid', registerForm.debug());
    $('#registerSubmit').prop('disabled', 'disabled');
  },
  onValid: () => {
    console.log('onValid');
    $('#registerSubmit').removeProp('disabled');
  }
});
