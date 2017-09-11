import PropTypes from 'prop-types'
import React from 'react'
import block from 'bem-cn'
import Facebook from '../../../../components/main_layout/public/icons/facebook.svg'
import { Field, reduxForm } from 'redux-form'
import { compose } from 'underscore'
import { connect } from 'react-redux'
import { data as sd } from 'sharify'
import { renderTextInput } from '../text_input'
import {
  logIn,
  updateAuthFormStateAndClearError
} from '../../client/actions'

function validate (values) {
  const {
    email,
    password
  } = values
  const errors = {}

  if (!email) errors.email = 'Required'
  if (!password) errors.password = 'Required'

  return errors
}

function LogIn (props) {
  const {
    error,
    handleSubmit,
    logInAction,
    invalid,
    pristine,
    updateAuthFormStateAndClearErrorAction
  } = props

  const b = block('consignments-submission-log-in')

  return (
    <div className={b()}>
      <div className={b('title')}>
        Log In
      </div>
      <div className={b('subtitle')}>
        New to Artsy? <span className={b('clickable')} onClick={() => updateAuthFormStateAndClearErrorAction('signUp')}>Sign up</span>.
      </div>
      <form className={b('form')} onSubmit={handleSubmit(logInAction)}>
        <div className={b('row')}>
          <div className={b('row-item')}>
            <Field name='email' component={renderTextInput}
              item={'email'}
              label={'Email'}
              autofocus
            />
          </div>
        </div>
        <div className={b('row', {'no-padding': true})}>
          <div className={b('row-item')}>
            <Field name='password' component={renderTextInput}
              item={'password'}
              label={'Password'}
              type={'password'}
            />
          </div>
        </div>
        <div className={b('forgot-password')}>
          <span className={b('clickable')} onClick={() => updateAuthFormStateAndClearErrorAction('forgotPassword')}>Forgot Password</span>
        </div>
        <button
          className={b('log-in-button').mix('avant-garde-button-black')}
          disabled={pristine || invalid}
          type='submit'
        >
          Log In
        </button>
        {
          error && <div className={b('error')}>{error}</div>
        }
        <div className={b('or')}>
          <div className={b('or-content')}>Or</div>
        </div>
        <a
          className={b('facebook-button').mix('avant-garde-button')}
          href={sd.AP.facebookPath}
        >
          <Facebook />
          <span>Connect with Facebook</span>
        </a>
      </form>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    error: state.submissionFlow.error
  }
}

const mapDispatchToProps = {
  logInAction: logIn,
  updateAuthFormStateAndClearErrorAction: updateAuthFormStateAndClearError
}

LogIn.propTypes = {
  error: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  invalid: PropTypes.bool,
  logInAction: PropTypes.func.isRequired,
  pristine: PropTypes.bool,
  updateAuthFormStateAndClearErrorAction: PropTypes.func.isRequired
}

export default compose(
  reduxForm({
    form: 'logIn', // a unique identifier for this form
    validate
  }),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(LogIn)
