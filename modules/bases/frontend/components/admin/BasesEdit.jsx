/* eslint-disable react/prop-types */

import React, { lazy, Component } from 'react';
import { I18n } from '@lingui/react';
import { connect } from 'react-redux';
import { remove as removeCookie } from 'es-cookie';
import UIkit from 'uikit';
import axios from 'axios';
import { Trans, t } from '@lingui/macro';
import { history } from '../../../../../shared/store/configureStore';
import appDataRuntimeSetToken from '../../../../../shared/actions/appDataRuntimeSetToken';
import appDataSetUser from '../../../../../shared/actions/appDataSetUser';
import config from '../../../../../etc/config.json';
import appDataRuntimeSetDocumentTitle from '../../../../../shared/actions/appDataRuntimeSetDocumentTitle';

const AdminPanel = lazy(() => import(/* webpackMode: "lazy", webpackChunkName: "AdminPanel" */'../../../../../shared/components/AdminPanel/AdminPanel.jsx'));
const FormBuilder = lazy(() => import(/* webpackMode: "lazy", webpackChunkName: "FormBuilder" */'../../../../../shared/components/FormBuilder/index.jsx'));

class BasesEdit extends Component {
    constructor(props) {
        super(props);
        this.editUserForm = React.createRef();
    }

    state = {
        loadingError: false
    }

    componentDidMount = () => {
        if (!this.props.appDataRuntime.token) {
            history.push('/users/auth?redirect=/admin/bases');
        }
    }

    deauthorize = () => {
        this.props.appDataRuntimeSetTokenAction(null);
        this.props.appDataSetUserAction({});
        removeCookie(`${config.siteId}_auth`);
        history.push(`/users/auth?redirect=/admin/bases`);
    }

    onBasesTableLoadError = data => {
        if (data && data.statusCode === 403) {
            this.deauthorize();
        }
    }

    onSaveSuccessHandler = i18n => {
        UIkit.notification({
            message: i18n._('Data has been saved successfully'),
            status: 'success'
        });
        history.push('/admin/bases?reload=1');
    }

    loadDestinations = (i18n, data) => new Promise(async resolve => {
        if (this.editUserForm.current) {
            await this.editUserForm.current.setProperty('destination', 'disabled', true);
            await this.editUserForm.current.setProperty('country', 'disabled', true);
        }
        axios.post(`${config.apiURL}/api/bases/getDestinations`, {
            token: this.props.appDataRuntime.token,
            language: this.props.appData.language,
            destination: data ? data.default.destination : undefined
        }, { headers: { 'content-type': 'application/json' } }).then(async res => {
            await this.editUserForm.current.setProperty('destination', 'disabled', null);
            await this.editUserForm.current.setProperty('destination', 'values', res.data.destinations);
            await this.editUserForm.current.setProperty('country', 'disabled', null);
            await this.editUserForm.current.setProperty('country', 'values', res.data.countries);
            if (data) {
                await this.editUserForm.current.setProperty('country', 'value', data.default.country);
            }
            resolve({
                destinations: res.data.destinations,
                countries: res.data.countries
            });
        }).catch(async () => {
            await this.editUserForm.current.setProperty('destination', 'disabled', null);
            await this.editUserForm.current.setProperty('country', 'disabled', null);
            UIkit.notification({
                message: i18n._('Could not get a list of destinations'),
                status: 'danger'
            });
        });
    });

    onFormBuilt = async i18n => {
        if (!this.props.match.params.id) {
            const { destinations, countries } = await this.loadDestinations(i18n);
            await this.editUserForm.current.setValue('destination', destinations && Object.keys(destinations).length ? Object.keys(destinations)[0] : {}, 'default');
            await this.editUserForm.current.setValue('country', countries && Object.keys(countries).length ? Object.keys(countries)[0] : {}, 'default');
        }
    }

    onDestinationChange = async (destination, i18n) => {
        await this.editUserForm.current.setProperty('country', 'disabled', true);
        axios.post(`${config.apiURL}/api/bases/getCountries`, {
            token: this.props.appDataRuntime.token,
            language: this.props.appData.language,
            destination
        }, { headers: { 'content-type': 'application/json' } }).then(async res => {
            await this.editUserForm.current.setProperty('country', 'disabled', null);
            await this.editUserForm.current.setProperty('country', 'values', res.data.countries);
        }).catch(async () => {
            await this.editUserForm.current.setProperty('country', 'disabled', null);
            UIkit.notification({
                message: i18n._('Could not get a list of countries'),
                status: 'danger'
            });
        });
    }

    getEditForm = i18n => (<FormBuilder
        ref={this.editUserForm}
        prefix="editUserForm"
        UIkit={UIkit}
        axios={axios}
        i18n={i18n}
        data={
            [
                {
                    id: 'destination',
                    type: 'select',
                    label: `${i18n._(t`Destination`)}:`,
                    css: 'uk-form-width-large',
                    defaultValue: '',
                    values: {},
                    autofocus: true,
                    onChange: (id, value) => this.onDestinationChange(value, i18n)
                },
                {
                    id: 'country',
                    type: 'select',
                    label: `${i18n._(t`Country`)}:`,
                    css: 'uk-form-width-large',
                    defaultValue: '',
                    values: {}
                },
                [
                    {
                        id: 'name',
                        type: 'text',
                        css: 'uk-form-width-medium',
                        label: `${i18n._(t`Base`)}:`
                    },
                    {
                        id: 'name_ru',
                        type: 'text',
                        css: 'uk-form-width-medium',
                        label: `${i18n._(t`Base (RU)`)}:`
                    }
                ],
                {
                    id: 'divider1',
                    type: 'divider'
                },
                [
                    {
                        id: 'btnCancel',
                        type: 'button',
                        buttonType: 'link',
                        linkTo: '/admin/bases',
                        css: 'uk-button-default uk-margin-small-right',
                        label: i18n._(t`Cancel`)
                    }, {
                        id: 'btnSave',
                        type: 'button',
                        buttonType: 'submit',
                        css: 'uk-button-primary',
                        label: i18n._(t`Save`)
                    }
                ]
            ]
        }
        validation={
            {
                username: {
                    mandatory: true,
                    regexp: /^[a-zA-Z0-9_-]{4,32}$/
                },
                email: {
                    mandatory: true,
                    // eslint-disable-next-line no-control-regex
                    regexp: /^(?:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-])+@(?:[a-zA-Z0-9]|[^\u0000-\u007F])(?:(?:[a-zA-Z0-9-]|[^\u0000-\u007F]){0,61}(?:[a-zA-Z0-9]|[^\u0000-\u007F]))?(?:\.(?:[a-zA-Z0-9]|[^\u0000-\u007F])(?:(?:[a-zA-Z0-9-]|[^\u0000-\u007F]){0,61}(?:[a-zA-Z0-9]|[^\u0000-\u007F]))?)*$/
                },
                password: {
                    shouldMatch: 'password2'
                },
                password2: {
                    shouldMatch: 'password'
                }
            }
        }
        lang={{
            ERR_VMANDATORY: i18n._(t`Field is required`),
            ERR_VFORMAT: i18n._(t`Invalid format`),
            ERR_VNOMATCH: i18n._(t`Passwords do not match`),
            ERR_LOAD: i18n._(t`Could not load data from server`),
            ERR_SAVE: i18n._(t`Could not save data`),
            WILL_BE_DELETED: i18n._(t`will be deleted. Are you sure?`),
            YES: i18n._(t`Yes`),
            CANCEL: i18n._(t`Cancel`)
        }}
        save={{
            url: `${config.apiURL}/api/bases/save`,
            method: 'POST',
            extras: {
                id: this.props.match.params.id,
                token: this.props.appDataRuntime.token
            }
        }}
        load={this.props.match.params.id ? {
            url: `${config.apiURL}/api/bases/load`,
            method: 'POST',
            extras: {
                id: this.props.match.params.id,
                token: this.props.appDataRuntime.token
            }
        } : null}
        onSaveSuccess={() => this.onSaveSuccessHandler(i18n)}
        onLoadError={() => this.setState({ loadingError: true })}
        onLoadSuccess={() => this.setState({ loadingError: false })}
        onDataDeserialized={data => this.loadDestinations(i18n, data)}
        onFormBuilt={i18n => this.onFormBuilt(i18n)}
    />);

    reloadEditFormData = e => {
        e.preventDefault();
        this.setState({ loadingError: false });
    }

    render = () => (
        <AdminPanel>
            <I18n>
                {({ i18n }) => {
                    this.props.appDataRuntimeSetDocumentTitleAction(i18n._(this.props.match.params.id ? 'Edit Base' : 'New Base'), this.props.appData.language);
                    return (<>
                        <h1>{this.props.match.params.id ? <Trans>Edit Base</Trans> : <Trans>New Base</Trans>}</h1>
                        {this.state.loadingError ? <div className="uk-alert-danger" uk-alert="true">
                            <Trans>Could not load data from server. Please check your URL or try to <a href="" onClick={this.reloadEditFormData}>reload</a> data.</Trans>
                        </div> : this.getEditForm(i18n)}
                    </>);
                }}
            </I18n>
        </AdminPanel>
    );
}

export default connect(store => ({
    appData: store.appData,
    appDataRuntime: store.appDataRuntime,
    appLingui: store.appLingui
}),
    dispatch => ({
        appDataRuntimeSetTokenAction: token => dispatch(appDataRuntimeSetToken(token)),
        appDataSetUserAction: user => dispatch(appDataSetUser(user)),
        appDataRuntimeSetDocumentTitleAction: (documentTitle, language) => dispatch(appDataRuntimeSetDocumentTitle(documentTitle, language))
    }))(BasesEdit);