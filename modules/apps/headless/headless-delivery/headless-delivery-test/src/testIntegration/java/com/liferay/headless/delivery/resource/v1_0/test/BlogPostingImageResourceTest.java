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

package com.liferay.headless.delivery.resource.v1_0.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.blogs.service.BlogsEntryLocalServiceUtil;
import com.liferay.headless.delivery.client.dto.v1_0.BlogPostingImage;
import com.liferay.portal.kernel.repository.model.Folder;
import com.liferay.portal.kernel.service.UserLocalServiceUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.util.FileUtil;

import java.io.File;

import java.util.HashMap;
import java.util.Map;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Javier Gamarra
 */
@RunWith(Arquillian.class)
public class BlogPostingImageResourceTest
	extends BaseBlogPostingImageResourceTestCase {

	@Test
	public void testPostSiteBlogPostingImageRollback() throws Exception {
		Folder folder = BlogsEntryLocalServiceUtil.fetchAttachmentsFolder(
			UserLocalServiceUtil.getDefaultUserId(testGroup.getCompanyId()),
			testGroup.getGroupId());

		Assert.assertNull(folder);

		BlogPostingImage blogPostingImage = randomBlogPostingImage();

		blogPostingImage.setTitle("*,?");

		try {
			testPostSiteBlogPostingImage_addBlogPostingImage(blogPostingImage);

			Assert.fail();
		}
		catch (Throwable e) {
			Assert.assertTrue(e instanceof IllegalArgumentException);
		}

		folder = BlogsEntryLocalServiceUtil.fetchAttachmentsFolder(
			UserLocalServiceUtil.getDefaultUserId(testGroup.getCompanyId()),
			testGroup.getGroupId());

		Assert.assertNull(folder);
	}

	@Override
	protected String[] getIgnoredEntityFieldNames() {
		return new String[] {"fileExtension"};
	}

	@Override
	protected Map<String, File> getMultipartFiles() throws Exception {
		Map<String, File> files = new HashMap<>();

		String randomString = RandomTestUtil.randomString();

		files.put("file", FileUtil.createTempFile(randomString.getBytes()));

		return files;
	}

}