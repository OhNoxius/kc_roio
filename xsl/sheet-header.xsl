<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" encoding="UTF-8" />

	<xsl:param name="title" />
	<xsl:param name="edit" />

	<xsl:template match="/">
		<xsl:apply-templates select="*[1]" />
	</xsl:template>

	<!-- AUTO -->
	<xsl:template match="*[1]" priority="0">
		<!--<a href="index.html">-->
		<h1>
			<a href="" class="heading">
				<xsl:choose>
					<xsl:when test="$title and not(string($title) = 'undefined')">
						<xsl:value-of select="$title" />
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="name(.)" />
					</xsl:otherwise>
				</xsl:choose>
			</a>
			<xsl:if test="$edit and not(string($edit) = 'undefined')">
				<span class="details"> (<a href="{$edit}" id="linkEdit" class="link" target="_blank">edit...</a>)</span>
			</xsl:if>
		</h1>

	</xsl:template>

</xsl:stylesheet>
