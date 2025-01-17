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

package com.liferay.headless.admin.user.internal.resource.v1_0;

import com.liferay.headless.admin.user.dto.v1_0.EmailAddress;
import com.liferay.headless.admin.user.resource.v1_0.EmailAddressResource;
import com.liferay.petra.function.UnsafeFunction;
import com.liferay.portal.kernel.model.Company;
import com.liferay.portal.vulcan.accept.language.AcceptLanguage;
import com.liferay.portal.vulcan.pagination.Page;
import com.liferay.portal.vulcan.util.TransformUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.tags.Tags;

import java.util.Collections;
import java.util.List;

import javax.annotation.Generated;

import javax.validation.constraints.NotNull;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriInfo;

/**
 * @author Javier Gamarra
 * @generated
 */
@Generated("")
@Path("/v1.0")
public abstract class BaseEmailAddressResourceImpl
	implements EmailAddressResource {

	@Override
	@GET
	@Operation(description = "Retrieves the email address.")
	@Parameters(
		value = {@Parameter(in = ParameterIn.PATH, name = "emailAddressId")}
	)
	@Path("/email-addresses/{emailAddressId}")
	@Produces({"application/json", "application/xml"})
	@Tags(value = {@Tag(name = "EmailAddress")})
	public EmailAddress getEmailAddress(
			@NotNull @Parameter(hidden = true) @PathParam("emailAddressId") Long
				emailAddressId)
		throws Exception {

		return new EmailAddress();
	}

	@Override
	@GET
	@Operation(description = "Retrieves the organization's email addresses.")
	@Parameters(
		value = {@Parameter(in = ParameterIn.PATH, name = "organizationId")}
	)
	@Path("/organizations/{organizationId}/email-addresses")
	@Produces({"application/json", "application/xml"})
	@Tags(value = {@Tag(name = "EmailAddress")})
	public Page<EmailAddress> getOrganizationEmailAddressesPage(
			@NotNull @Parameter(hidden = true) @PathParam("organizationId") Long
				organizationId)
		throws Exception {

		return Page.of(Collections.emptyList());
	}

	@Override
	@GET
	@Operation(description = "Retrieves the user's email addresses.")
	@Parameters(
		value = {@Parameter(in = ParameterIn.PATH, name = "userAccountId")}
	)
	@Path("/user-accounts/{userAccountId}/email-addresses")
	@Produces({"application/json", "application/xml"})
	@Tags(value = {@Tag(name = "EmailAddress")})
	public Page<EmailAddress> getUserAccountEmailAddressesPage(
			@NotNull @Parameter(hidden = true) @PathParam("userAccountId") Long
				userAccountId)
		throws Exception {

		return Page.of(Collections.emptyList());
	}

	public void setContextCompany(Company contextCompany) {
		this.contextCompany = contextCompany;
	}

	protected void preparePatch(
		EmailAddress emailAddress, EmailAddress existingEmailAddress) {
	}

	protected <T, R> List<R> transform(
		java.util.Collection<T> collection,
		UnsafeFunction<T, R, Exception> unsafeFunction) {

		return TransformUtil.transform(collection, unsafeFunction);
	}

	protected <T, R> R[] transform(
		T[] array, UnsafeFunction<T, R, Exception> unsafeFunction,
		Class<?> clazz) {

		return TransformUtil.transform(array, unsafeFunction, clazz);
	}

	protected <T, R> R[] transformToArray(
		java.util.Collection<T> collection,
		UnsafeFunction<T, R, Exception> unsafeFunction, Class<?> clazz) {

		return TransformUtil.transformToArray(
			collection, unsafeFunction, clazz);
	}

	protected <T, R> List<R> transformToList(
		T[] array, UnsafeFunction<T, R, Exception> unsafeFunction) {

		return TransformUtil.transformToList(array, unsafeFunction);
	}

	@Context
	protected AcceptLanguage contextAcceptLanguage;

	@Context
	protected Company contextCompany;

	@Context
	protected UriInfo contextUriInfo;

}