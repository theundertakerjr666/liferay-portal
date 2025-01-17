/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.talend.connection;

import com.liferay.talend.LiferayBaseComponentDefinition;
import com.liferay.talend.exception.ExceptionUtils;
import com.liferay.talend.runtime.LiferaySourceOrSinkRuntime;
import com.liferay.talend.runtime.ValidatedSoSSandboxRuntime;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.talend.components.api.exception.ComponentException;
import org.talend.components.api.properties.ComponentPropertiesImpl;
import org.talend.daikon.NamedThing;
import org.talend.daikon.SimpleNamedThing;
import org.talend.daikon.i18n.GlobalI18N;
import org.talend.daikon.i18n.I18nMessageProvider;
import org.talend.daikon.i18n.I18nMessages;
import org.talend.daikon.properties.Properties;
import org.talend.daikon.properties.ValidationResult;
import org.talend.daikon.properties.ValidationResultMutable;
import org.talend.daikon.properties.presentation.Form;
import org.talend.daikon.properties.presentation.Widget;
import org.talend.daikon.properties.property.StringProperty;
import org.talend.daikon.properties.service.Repository;

/**
 * @author Zoltán Takács
 */
public class LiferaySiteSelectorProperties
	extends ComponentPropertiesImpl
	implements LiferayConnectionPropertiesProvider {

	public LiferaySiteSelectorProperties(String name) {
		super(name);
	}

	public ValidationResult afterFormFinishMain(
		Repository<Properties> repository) {

		try {
			ValidatedSoSSandboxRuntime validatedSoSSandboxRuntime =
				LiferayBaseComponentDefinition.initializeSandboxedRuntime(
					getLiferayConnectionProperties());

			ValidationResultMutable validationResultMutable =
				validatedSoSSandboxRuntime.getValidationResultMutable();

			if (validationResultMutable.getStatus() ==
					ValidationResult.Result.ERROR) {

				return validationResultMutable;
			}

			ArrayList<SimpleNamedThing> webSitePropertyStoredValues =
				(ArrayList<SimpleNamedThing>)
					wizardWebSiteProperty.getStoredValue();

			if ((webSitePropertyStoredValues != null) &&
				!webSitePropertyStoredValues.isEmpty()) {

				SimpleNamedThing webSitePropertySimpleNamedThing =
					webSitePropertyStoredValues.get(0);

				connection.siteName.setValue(
					webSitePropertySimpleNamedThing.getDisplayName());

				connection.siteId.setValue(
					webSitePropertySimpleNamedThing.getName());
			}

			repository.storeProperties(
				connection, connection.name.getValue(), repositoryLocation,
				null);

			return validationResultMutable;
		}
		catch (Exception e) {
			if (_log.isDebugEnabled()) {
				_log.debug("Unable to save the metadata", e);
			}

			return ExceptionUtils.exceptionToValidationResult(e);
		}
	}

	public ValidationResult beforeFormPresentMain() throws Exception {
		ValidatedSoSSandboxRuntime validatedSoSSandboxRuntime =
			LiferayBaseComponentDefinition.initializeSandboxedRuntime(
				getLiferayConnectionProperties());

		ValidationResultMutable validationResultMutable =
			validatedSoSSandboxRuntime.getValidationResultMutable();

		if (validationResultMutable.getStatus() ==
				ValidationResult.Result.ERROR) {

			return validationResultMutable;
		}

		LiferaySourceOrSinkRuntime liferaySourceOrSinkRuntime =
			validatedSoSSandboxRuntime.getLiferaySourceOrSinkRuntime();

		if (validationResultMutable.getStatus() == ValidationResult.Result.OK) {
			try {
				_webSites = liferaySourceOrSinkRuntime.getAvailableWebSites();

				if (_webSites.isEmpty()) {
					validationResultMutable.setMessage(
						i18nMessages.getMessage("error.validation.websites"));
					validationResultMutable.setStatus(
						ValidationResult.Result.ERROR);
				}

				wizardWebSiteProperty.setPossibleNamedThingValues(_webSites);

				connection.siteId.setPossibleNamedThingValues(_webSites);

				Form form = getForm(Form.MAIN);

				form.setAllowBack(true);
				form.setAllowFinish(true);
			}
			catch (Exception e) {
				throw new ComponentException(e);
			}
		}

		return null;
	}

	@Override
	public LiferayConnectionProperties getLiferayConnectionProperties() {
		return connection;
	}

	public String getRepositoryLocation() {
		return repositoryLocation;
	}

	public void setConnection(
		LiferayConnectionProperties liferayConnectionProperties) {

		connection = liferayConnectionProperties;
	}

	public void setRepositoryLocation(String repositoryLocation) {
		this.repositoryLocation = repositoryLocation;
	}

	@Override
	public void setupLayout() {
		super.setupLayout();

		Form siteForm = Form.create(this, Form.MAIN);

		Widget webSitePropertyWizardWidget = Widget.widget(
			wizardWebSiteProperty);

		webSitePropertyWizardWidget.setWidgetType(
			Widget.NAME_SELECTION_AREA_WIDGET_TYPE);

		siteForm.addRow(webSitePropertyWizardWidget);

		refreshLayout(siteForm);
	}

	public volatile LiferayConnectionProperties connection =
		new LiferayConnectionProperties("connection");
	public StringProperty wizardWebSiteProperty = new StringProperty(
		"wizardWebSiteProperty");

	protected static final I18nMessages i18nMessages;

	static {
		I18nMessageProvider i18nMessageProvider =
			GlobalI18N.getI18nMessageProvider();

		i18nMessages = i18nMessageProvider.getI18nMessages(
			LiferaySiteSelectorProperties.class);
	}

	/**
	 * This must be named <code>repositoryLocation</code> since Talend uses
	 * reflection to get a field named this. See <a
	 * href="https://github.com/Talend/tdi-studio-se/blob/125a8144597e5d5faa1f7001ce345cdfd6dc1fe3/main/plugins/org.talend.repository.generic/src/main/java/org/talend/repository/generic/ui/GenericConnWizard.java#L111">here</a>
	 * for more information.
	 */
	protected String repositoryLocation;

	private static final Logger _log = LoggerFactory.getLogger(
		LiferaySiteSelectorProperties.class);

	private List<NamedThing> _webSites;

}